"""Otak Eling: memori jangka panjang via Walrus Memory + generasi jawaban via Gemini."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from config import Settings

log = logging.getLogger(__name__)

# Batas jarak (distance) untuk hasil recall yang dianggap relevan.
RECALL_MAX_DISTANCE = 0.8
# Batas jarak untuk deduplikasi: fakta dianggap sudah ada kalau ada hasil
# recall yang jaraknya di bawah nilai ini.
DEDUP_MAX_DISTANCE = 0.25

_PLACEHOLDER_KEYS = {"", "changeme", "your-key-here", "placeholder", "xxx"}


def _looks_like_placeholder(value: str) -> bool:
    v = (value or "").strip()
    return v.lower() in _PLACEHOLDER_KEYS or v.lower().startswith("xxx-")


# ---------------------------------------------------------------------------
# Mock lokal (dipakai hanya kalau package `memwal` tidak terinstal sama sekali)
# ---------------------------------------------------------------------------
class _LocalMemWalMock:
    """Mock in-memory minimal dengan interface yang sama seperti MemWalMock."""

    def __init__(self) -> None:
        self._store: dict[str, list[str]] = {}

    @classmethod
    def create(cls, namespace: str = "dev") -> "_LocalMemWalMock":
        return cls()

    async def recall(self, params: Any, **kwargs: Any) -> Any:
        ns = getattr(params, "namespace", None) or kwargs.get("namespace") or "dev"
        query = (getattr(params, "query", "") or "").lower()
        limit = getattr(params, "limit", 10) or 10
        max_distance = getattr(params, "max_distance", None)
        hits = []
        for text in self._store.get(ns, []):
            distance = 0.0 if query and query in text.lower() else 1.0
            if max_distance is not None and distance > max_distance:
                continue
            hits.append(type("Hit", (), {"text": text, "distance": distance})())
        hits.sort(key=lambda h: h.distance)
        return type("RecallResult", (), {"results": hits[:limit], "total": len(hits)})()

    async def remember_and_wait(self, text: str, namespace: Optional[str] = None, **kwargs: Any) -> Any:
        self._store.setdefault(namespace or "dev", []).append(text)
        return {"ok": True}

    async def analyze_and_wait(self, text: str, namespace: Optional[str] = None, **kwargs: Any) -> Any:
        fact = type("Fact", (), {"text": text})()
        return type("AnalyzeResult", (), {"facts": [fact]})()


# ---------------------------------------------------------------------------
# Factory: memwal client (real atau mock)
# ---------------------------------------------------------------------------
def create_memwal_client(settings: Settings) -> Any:
    """Bikin client Walrus Memory.

    Balikin client real (MemWal) kalau MEMWAL_PRIVATE_KEY terisi valid,
    kalau tidak balikin MemWalMock.create(namespace="dev") + warning,
    supaya testing dan dev offline tetap jalan.
    """
    try:
        from memwal import MemWal, MemWalConfig, MemWalMock
    except ImportError:
        print("[Eling] WARNING: package 'memwal' tidak terinstal — pakai mock in-memory (mode offline).")
        return _LocalMemWalMock.create(namespace="dev")

    key = (settings.memwal_private_key or "").strip()
    if not key or _looks_like_placeholder(key):
        print("[Eling] WARNING: MEMWAL_PRIVATE_KEY kosong/placeholder — pakai MemWalMock (mode offline).")
        return MemWalMock.create(namespace="dev")

    config = MemWalConfig(
        key=key,
        account_id=(settings.memwal_account_id or "").strip(),
        server_url=settings.memwal_server_url,
        namespace="dev",
    )
    return MemWal(config)


def create_gemini_client(settings: Settings) -> Optional[Any]:
    """Bikin client Gemini, atau None kalau API key belum dikonfigurasi."""
    key = (settings.gemini_api_key or "").strip()
    if not key or _looks_like_placeholder(key):
        print("[Eling] WARNING: GEMINI_API_KEY kosong/placeholder — bot jalan tanpa LLM.")
        return None
    try:
        from google import genai
    except ImportError:
        print("[Eling] WARNING: package 'google-genai' tidak terinstal — bot jalan tanpa LLM.")
        return None
    return genai.Client(api_key=key)


# ---------------------------------------------------------------------------
# ElingBrain
# ---------------------------------------------------------------------------
class ElingBrain:
    """Core logic Eling: recall memori -> bangun prompt -> Gemini -> simpan memori baru."""

    def __init__(self, memwal_client: Any, gemini_client: Optional[Any], model_name: str = "gemini-2.0-flash"):
        self.memwal = memwal_client
        self.gemini = gemini_client
        self.model_name = model_name

    # -- helpers -----------------------------------------------------------
    @staticmethod
    def _namespace(user_id: int) -> str:
        """Satu ruang memori terisolasi per user Telegram."""
        return f"eling:u{user_id}"

    async def _recall(
        self, namespace: str, query: str, limit: int = 5, max_distance: float = RECALL_MAX_DISTANCE
    ) -> list[tuple[str, float]]:
        """Recall memori, kembalikan [(text, distance)] yang jaraknya < max_distance."""
        from memwal import RecallParams

        result = await self.memwal.recall(
            RecallParams(query=query, namespace=namespace, limit=limit, max_distance=max_distance)
        )
        hits: list[tuple[str, float]] = []
        for item in getattr(result, "results", []) or []:
            text = getattr(item, "text", "") or ""
            distance = getattr(item, "distance", 1.0)
            if text and distance < max_distance:
                hits.append((text, distance))
        hits.sort(key=lambda h: h[1])
        return hits

    def _system_prompt(self, memories: list[tuple[str, float]]) -> str:
        if memories:
            bullet = "\n".join(f"- {text}" for text, _ in memories)
        else:
            bullet = "- (Belum ada ingatan tersimpan tentang user ini.)"
        return (
            "Kamu adalah Eling, teman AI yang ingat segalanya tentang user ini. "
            "Kamu ngobrol santai, akrab, dan hangat dalam Bahasa Indonesia, kayak temen deket. "
            "Jawabanmu ringkas tapi bermakna.\n\n"
            "Hal yang kamu ingat tentang user ini:\n"
            f"{bullet}\n\n"
            "Aturan:\n"
            "1. Pakai ingatan di atas secara natural kalau relevan dengan obrolan — jangan dipaksa semua sekaligus.\n"
            "2. JANGAN PERNAH mengarang ingatan yang tidak ada di daftar. Kalau tidak ada di daftar, "
            "bilang saja kamu belum tahu / belum ingat, jangan nebak.\n"
            "3. Kalau user cerita fakta baru tentang dirinya (nama, kesukaan, rencana, dll), "
            "respon seolah kamu akan mengingatnya baik-baik."
        )

    def _generate_sync(self, system_instruction: str, user_text: str) -> str:
        """Panggil LLM secara sinkron (dijalankan via to_thread oleh pemanggil)."""
        client = self.gemini
        models = getattr(client, "models", None)
        if models is not None:
            # google-genai modern API: client.models.generate_content(...)
            from google.genai import types

            resp = models.generate_content(
                model=self.model_name,
                contents=user_text,
                config=types.GenerateContentConfig(system_instruction=system_instruction),
            )
            return (getattr(resp, "text", "") or "").strip()
        # Interface sederhana (dipakai test stub / client kustom):
        # client.generate_content(full_prompt) -> str
        return str(client.generate_content(f"{system_instruction}\n\nUser: {user_text}")).strip()

    # -- public API --------------------------------------------------------
    async def handle_message(self, user_id: int, text: str) -> str:
        """Proses satu pesan user: recall memori -> Gemini -> kembalikan balasan."""
        namespace = self._namespace(user_id)
        memories: list[tuple[str, float]] = []
        try:
            memories = await self._recall(namespace, text, limit=5, max_distance=RECALL_MAX_DISTANCE)
        except Exception:
            log.exception("Recall memori gagal, lanjut tanpa ingatan")

        if self.gemini is None:
            return (
                "Waduh, otakku (Gemini) belum dikonfigurasi nih. "
                "Minta admin bot ini buat isi GEMINI_API_KEY dulu ya 🙏"
            )

        system_instruction = self._system_prompt(memories)
        try:
            reply = await asyncio.to_thread(self._generate_sync, system_instruction, text)
        except Exception:
            log.exception("Gemini generate_content gagal")
            return "Duh, aku lagi error mikir nih. Coba kirim lagi pesanmu sebentar ya 🙏"
        return reply or "Hmm, aku kehabisan kata-kata nih. Coba tanya lagi dengan cara lain ya!"

    async def save_memory_background(self, user_id: int, user_text: str, assistant_text: str) -> None:
        """Ekstrak fakta dari percakapan dan simpan ke Walrus Memory.

        Dijalankan fire-and-forget setelah membalas chat. TIDAK PERNAH raise:
        semua error ditangkap dan di-log supaya chat tidak pernah rusak gara-gara ini.
        """
        namespace = self._namespace(user_id)
        try:
            from memwal import RecallParams

            analysis = await self.memwal.analyze_and_wait(
                f"User: {user_text}\nEling: {assistant_text}", namespace=namespace
            )
            facts = getattr(analysis, "facts", []) or []
            for fact in facts:
                fact_text = (getattr(fact, "text", "") or "").strip()
                if not fact_text:
                    continue
                # Dedup: skip kalau fakta serupa sudah tersimpan.
                existing = await self.memwal.recall(
                    RecallParams(query=fact_text, namespace=namespace, limit=3)
                )
                if any(
                    getattr(item, "distance", 1.0) < DEDUP_MAX_DISTANCE
                    for item in getattr(existing, "results", []) or []
                ):
                    continue
                await self.memwal.remember_and_wait(fact_text, namespace=namespace)
        except Exception:
            log.exception("save_memory_background gagal (diabaikan)")

    async def list_memories(self, user_id: int, limit: int = 30) -> list[str]:
        """Kembalikan daftar teks ingatan user, diurutkan dari yang paling relevan."""
        namespace = self._namespace(user_id)
        hits = await self._recall(namespace, "facts about the user", limit=limit, max_distance=1.0)
        return [text for text, _ in hits]
