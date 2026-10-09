"""Konfigurasi Eling: memuat environment variables dan memvalidasinya."""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass
class Settings:
    """Semua konfigurasi yang dibutuhkan bot."""

    telegram_token: str
    gemini_api_key: str
    gemini_model: str = "gemini-2.0-flash"
    memwal_private_key: str = ""
    memwal_account_id: str = ""
    memwal_server_url: str = "https://relayer.memory.walrus.xyz"
    web_port: int = 8000


# Variabel yang WAJIB ada agar bot bisa jalan. MEMWAL_* sengaja opsional:
# kalau kosong, brain.py otomatis pakai mode mock (offline dev / testing).
_REQUIRED_VARS = ("TELEGRAM_TOKEN", "GEMINI_API_KEY")


def load_settings() -> Settings:
    """Muat .env dan kembalikan Settings.

    Raises:
        RuntimeError: kalau ada variabel wajib yang belum diisi, lengkap
            dengan daftar nama variabel yang hilang.
    """
    load_dotenv()

    missing = [name for name in _REQUIRED_VARS if not os.environ.get(name, "").strip()]
    if missing:
        raise RuntimeError(
            "Variabel environment berikut belum diisi: "
            + ", ".join(missing)
            + ". Salin .env.example ke .env lalu isi nilainya."
        )

    return Settings(
        telegram_token=os.environ["TELEGRAM_TOKEN"].strip(),
        gemini_api_key=os.environ["GEMINI_API_KEY"].strip(),
        gemini_model=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash").strip(),
        memwal_private_key=os.environ.get("MEMWAL_PRIVATE_KEY", "").strip(),
        memwal_account_id=os.environ.get("MEMWAL_ACCOUNT_ID", "").strip(),
        memwal_server_url=os.environ.get(
            "MEMWAL_SERVER_URL", "https://relayer.memory.walrus.xyz"
        ).strip(),
        web_port=int(os.environ.get("WEB_PORT", "8000").strip() or "8000"),
    )
