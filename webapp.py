"""Web widget Eling: chat lintas-device yang berbagi memori Walrus Memory
yang sama dengan bot Telegram.

Alur pairing: user menjalankan /pair di Telegram, mendapat kode 6 digit,
lalu memasukkannya di widget ini. Sesi web kemudian terhubung ke namespace
memori yang sama (eling:u{user_id}) — inilah demo "ingat lintas device".
"""
from __future__ import annotations

import asyncio
import logging
import secrets
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from brain import ElingBrain
from i18n import t as t_ui
from langstore import get_lang

log = logging.getLogger(__name__)

WEB_DIR = Path(__file__).resolve().parent / "web"

# token sesi web -> (user_id Telegram, waktu kedaluwarsa)
SESSION_TTL_SECONDS = 24 * 3600


class PairRequest(BaseModel):
    code: str


class ChatRequest(BaseModel):
    token: str
    message: str


def create_web_app(
    brain: ElingBrain,
    pair_codes: dict[str, tuple[int, float]],
) -> FastAPI:
    """Bangun FastAPI app. pair_codes adalah dict yang SAMA dengan milik
    bot Telegram ({kode: (user_id, expiry)}), jadi pairing lintas proses
    tidak diperlukan — semuanya satu proses."""
    sessions: dict[str, tuple[int, float]] = {}

    app = FastAPI(title="Eling Web Widget", version="0.1.0")

    def _user_for_token(token: str) -> int:
        entry = sessions.get(token)
        if not entry:
            raise HTTPException(status_code=401, detail="Sesi tidak valid.")
        user_id, exp = entry
        if exp < time.time():
            del sessions[token]
            raise HTTPException(status_code=401, detail="Sesi kedaluwarsa.")
        return user_id

    @app.get("/", include_in_schema=False)
    async def index() -> FileResponse:
        return FileResponse(WEB_DIR / "index.html")

    @app.post("/api/pair")
    async def pair(req: PairRequest) -> dict:
        code = req.code.strip()
        entry = pair_codes.pop(code, None)
        if not entry:
            raise HTTPException(
                status_code=400,
                detail="Kode salah atau sudah dipakai. Minta kode baru via /pair di Telegram.",
            )
        user_id, exp = entry
        if exp < time.time():
            raise HTTPException(
                status_code=400,
                detail="Kode kedaluwarsa. Minta kode baru via /pair di Telegram.",
            )
        token = secrets.token_hex(24)
        sessions[token] = (user_id, time.time() + SESSION_TTL_SECONDS)
        log.info("Web pairing sukses untuk user_id=%s", user_id)
        return {"token": token, "lang": get_lang(user_id)}

    @app.post("/api/chat")
    async def chat(req: ChatRequest) -> dict:
        user_id = _user_for_token(req.token)
        message = req.message.strip()
        if not message:
            raise HTTPException(status_code=400, detail="Pesan kosong.")
        reply = await brain.handle_message(user_id, message)
        asyncio.create_task(brain.save_memory_background(user_id, message, reply))
        return {"reply": reply}

    @app.get("/api/memories")
    async def memories(token: str) -> dict:
        user_id = _user_for_token(token)
        items = await brain.list_memories(user_id)
        return {"memories": items, "count": len(items)}

    return app
