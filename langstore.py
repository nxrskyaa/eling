"""Preferensi bahasa per user Telegram, disimpan lokal sebagai JSON.

Sengaja TIDAK disimpan di Walrus Memory: pilihan bahasa harus diketahui
SEBELUM recall/generate (untuk menyusun prompt), jadi butuh lookup sinkron
yang cepat dan tidak bergantung pada jaringan.
"""
from __future__ import annotations

import json
import logging
import threading
from pathlib import Path

log = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent / "data"
LANG_FILE = DATA_DIR / "lang_prefs.json"

DEFAULT_LANG = "id"
SUPPORTED = ("id", "en", "zh")

_lock = threading.Lock()


def _load() -> dict[str, str]:
    try:
        if LANG_FILE.exists():
            return json.loads(LANG_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        log.warning("Gagal baca %s, pakai kosong", LANG_FILE)
    return {}


def _save(prefs: dict[str, str]) -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        tmp = LANG_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(prefs, ensure_ascii=False), encoding="utf-8")
        tmp.replace(LANG_FILE)
    except OSError:
        log.exception("Gagal simpan preferensi bahasa")


def get_lang(user_id: int) -> str:
    """Kode bahasa user ('id'/'en'/'zh'), default 'id'."""
    lang = _load().get(str(user_id), DEFAULT_LANG)
    return lang if lang in SUPPORTED else DEFAULT_LANG


def has_lang(user_id: int) -> bool:
    return str(user_id) in _load()


def set_lang(user_id: int, lang: str) -> bool:
    """Simpan pilihan bahasa. Return False kalau kode tidak dikenal."""
    if lang not in SUPPORTED:
        return False
    with _lock:
        prefs = _load()
        prefs[str(user_id)] = lang
        _save(prefs)
    return True
