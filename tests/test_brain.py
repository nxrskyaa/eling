"""Test offline ElingBrain memakai MemWalMock (tanpa network, tanpa API key).

Dijalankan sebagai fungsi sync biasa yang membungkus coroutine dengan
asyncio.run, jadi tidak butuh plugin pytest-asyncio.
"""
import asyncio

from brain import ElingBrain
from memwal import MemWalMock


class FakeGemini:
    """Stub LLM: merekam prompt yang diterima, mengembalikan balasan dummy."""

    def __init__(self) -> None:
        self.last_prompt = ""

    def generate_content(self, prompt: str) -> str:
        self.last_prompt = prompt
        return "[stub-reply] siap, aku ingat!"


def _brain(mock=None, gemini="fake"):
    memwal_client = mock or MemWalMock.create(namespace="dev")
    gemini_client = FakeGemini() if gemini == "fake" else gemini
    return ElingBrain(memwal_client, gemini_client), memwal_client


def test_handle_message_recalls_memory_and_injects_into_prompt():
    async def scenario():
        brain, mock = _brain()
        await mock.remember_and_wait("User suka kopi tubruk", namespace="eling:u42")

        reply = await brain.handle_message(42, "kopi tubruk enak ya?")
        return brain, reply

    brain, reply = asyncio.run(scenario())
    assert reply == "[stub-reply] siap, aku ingat!"
    # Ingatan harus masuk ke system prompt yang dikirim ke LLM...
    assert "kopi tubruk" in brain.gemini.last_prompt
    assert "Eling" in brain.gemini.last_prompt
    assert "Hal yang kamu ingat tentang user ini" in brain.gemini.last_prompt
    # ...dan tidak boleh ada instruksi mengarang ingatan.
    assert "JANGAN PERNAH mengarang" in brain.gemini.last_prompt


def _patch_analyze_without_side_effects(mock, fact_text):
    """Ganti analyze_and_wait dengan versi tanpa efek samping (mock asli ikut menyimpan)."""

    async def fake_analyze(text, namespace=None, **kwargs):
        fact = type("Fact", (), {"text": fact_text})()
        return type("Analysis", (), {"facts": [fact]})()

    mock.analyze_and_wait = fake_analyze


def _count_remembers(mock):
    calls = []
    orig = mock.remember_and_wait

    async def counting(text, namespace=None, **kwargs):
        calls.append(text)
        return await orig(text, namespace=namespace, **kwargs)

    mock.remember_and_wait = counting
    return calls


def test_save_memory_background_dedup_skips_existing_fact():
    async def scenario():
        brain, mock = _brain()
        await mock.remember_and_wait("user lahir di Bandung", namespace="eling:u7")
        _patch_analyze_without_side_effects(mock, "user lahir di Bandung")
        calls = _count_remembers(mock)
        await brain.save_memory_background(7, "aku lahir di Bandung", "wah, dicatet ya!")
        await brain.save_memory_background(7, "aku lahir di Bandung", "wah, dicatet ya!")
        return calls

    calls = asyncio.run(scenario())
    assert calls == [], f"fakta yang sudah ada tidak boleh disimpan ulang, malah: {calls}"


def test_save_memory_background_stores_new_fact_once():
    async def scenario():
        brain, mock = _brain()
        _patch_analyze_without_side_effects(mock, "user suka kopi tubruk")
        calls = _count_remembers(mock)
        await brain.save_memory_background(8, "aku suka kopi tubruk", "noted!")
        await brain.save_memory_background(8, "aku suka kopi tubruk", "noted!")
        return calls

    calls = asyncio.run(scenario())
    assert len(calls) == 1
    assert "kopi tubruk" in calls[0]


def test_list_memories_returns_all_sorted():
    async def scenario():
        brain, mock = _brain()
        ns = "eling:u99"
        await mock.remember_and_wait("user suka kopi tubruk", namespace=ns)
        await mock.remember_and_wait("user tinggal di Bandung", namespace=ns)
        await mock.remember_and_wait("user ulang tahun 14 Mei", namespace=ns)
        return await brain.list_memories(99)

    memories = asyncio.run(scenario())
    assert len(memories) == 3
    assert any("kopi" in m for m in memories)
    assert any("Bandung" in m for m in memories)
    assert any("14 Mei" in m for m in memories)


def test_handle_message_without_gemini_key():
    async def scenario():
        brain, _ = _brain(gemini=None)
        return await brain.handle_message(1, "halo")

    reply = asyncio.run(scenario())
    assert "belum dikonfigurasi" in reply


def test_namespaces_are_isolated_per_user():
    async def scenario():
        brain, mock = _brain()
        await mock.remember_and_wait("rahasia user 5", namespace="eling:u5")
        return await brain.list_memories(6)

    memories = asyncio.run(scenario())
    assert memories == []


class _FlakyGemini:
    """Gagal di model pertama (503), sukses di model kedua."""

    def __init__(self):
        self.calls = []

    class _Models:
        def __init__(self, outer):
            self.outer = outer

        def generate_content(self, model, contents, config=None):
            self.outer.calls.append(model)
            if model == "model-utama":
                raise RuntimeError("503 UNAVAILABLE")
            return type("R", (), {"text": "ok dari cadangan"})()

    @property
    def models(self):
        return self._Models(self)


def test_generate_fallback_chain():
    import asyncio
    import sys

    sys.path.insert(0, "/home/hatch/workspace/walrus-hackathon/eling")
    from brain import ElingBrain
    from memwal import MemWalMock

    async def go():
        brain = ElingBrain(
            memwal_client=MemWalMock.create(namespace="t"),
            gemini_client=_FlakyGemini(),
            model_name="model-utama",
            model_names=["model-cadangan"],
        )
        return await brain.handle_message(1, "halo")

    reply = asyncio.run(go())
    assert reply == "ok dari cadangan"
