"""Wiring Telegram untuk Eling: command handler + message handler -> ElingBrain."""
from __future__ import annotations

import asyncio
import logging
import secrets
import time

from telegram import Update
from telegram.constants import ChatAction
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

from brain import ElingBrain, create_gemini_client, create_memwal_client
from config import load_settings

log = logging.getLogger(__name__)

# Kode pairing: {kode_6_digit: (user_id, waktu_kedaluwarsa)}.
# Dipakai nanti oleh web widget untuk menghubungkan sesi web ke user Telegram.
PAIR_CODES: dict[str, tuple[int, float]] = {}
PAIR_TTL_SECONDS = 10 * 60


def _prune_pair_codes() -> None:
    now = time.time()
    for code in [c for c, (_, exp) in PAIR_CODES.items() if exp < now]:
        del PAIR_CODES[code]


def _brain(context: ContextTypes.DEFAULT_TYPE) -> ElingBrain:
    return context.bot_data["brain"]


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    name = update.effective_user.first_name or "kamu"
    await update.message.reply_text(
        f"Halo {name}! Aku <b>Eling</b> — teman AI yang ingat segalanya tentang kamu. 🧠\n\n"
        "Ceritain aja apa pun: kesukaanmu, rencanamu, hal random — aku bakal mengingatnya, "
        "bahkan kalau kamu chat lagi besok atau dari device lain.\n\n"
        "<b>Cara pakai:</b>\n"
        "• Chat aja kayak biasa, aku otomatis mengingat fakta penting.\n"
        "• /memories — lihat semua yang aku ingat tentang kamu.\n"
        "• /pair — bikin kode pairing buat hubungin ke web widget.\n"
        "• /bantuan — lihat daftar perintah.\n\n"
        "Yuk kenalan! Siapa namamu dan apa yang lagi kamu suka akhir-akhir ini?",
        parse_mode="HTML",
    )


async def cmd_memories(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    brain = _brain(context)
    memories = await brain.list_memories(update.effective_user.id)
    if not memories:
        await update.message.reply_text(
            "Aku belum punya ingatan tentang kamu nih. Ceritain sesuatu dulu yuk, "
            "misalnya makanan favoritmu atau rencanamu minggu ini! 😊"
        )
        return
    lines = [f"{i}. {text}" for i, text in enumerate(memories, start=1)]
    await update.message.reply_text(
        "Ini semua yang aku ingat tentang kamu:\n\n" + "\n".join(lines)
    )


async def cmd_pair(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    _prune_pair_codes()
    code = f"{secrets.randbelow(900_000) + 100_000:06d}"
    PAIR_CODES[code] = (update.effective_user.id, time.time() + PAIR_TTL_SECONDS)
    await update.message.reply_text(
        f"Kode pairing kamu: <b>{code}</b>\n\n"
        "Masukkan kode ini di web widget Eling (segera hadir) untuk menghubungkan "
        "sesi web dengan akun Telegram-mu. Kode berlaku 10 menit.",
        parse_mode="HTML",
    )


async def cmd_bantuan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "<b>Perintah Eling:</b>\n"
        "/start — kenalan & mulai ngobrol\n"
        "/memories — lihat semua ingatanku tentang kamu\n"
        "/pair — bikin kode pairing buat web widget\n"
        "/bantuan — pesan ini\n\n"
        "Selain itu, chat aja bebas — aku otomatis mengingat hal-hal penting! 🧠",
        parse_mode="HTML",
    )


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    brain = _brain(context)
    user_id = update.effective_user.id
    user_text = update.message.text or ""

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action=ChatAction.TYPING)
    reply = await brain.handle_message(user_id, user_text)
    await update.message.reply_text(reply)

    # Simpan memori di background, jangan bikin user nunggu.
    asyncio.create_task(brain.save_memory_background(user_id, user_text, reply))


def main() -> None:
    logging.basicConfig(
        format="%(asctime)s %(name)s %(levelname)s: %(message)s", level=logging.INFO
    )
    try:
        settings = load_settings()
    except RuntimeError as exc:
        print(f"[Eling] ERROR: {exc}")
        raise SystemExit(1)

    asyncio.run(amain(settings))


async def amain(settings) -> None:
    """Jalankan bot Telegram (polling) + web widget dalam SATU event loop,
    supaya PAIR_CODES dan brain dipakai bersama tanpa masalah thread."""
    brain = ElingBrain(
        memwal_client=create_memwal_client(settings),
        gemini_client=create_gemini_client(settings),
        model_name=settings.gemini_model,
    )

    app = Application.builder().token(settings.telegram_token).build()
    app.bot_data["brain"] = brain

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("memories", cmd_memories))
    app.add_handler(CommandHandler("pair", cmd_pair))
    app.add_handler(CommandHandler(["bantuan", "help"], cmd_bantuan))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_message))

    from webapp import create_web_app

    web_app = create_web_app(brain, PAIR_CODES)

    await app.initialize()
    await app.start()
    await app.updater.start_polling()
    log.info("Eling jalan! Telegram polling + web widget di port %d.", settings.web_port)

    import uvicorn

    server = uvicorn.Server(
        uvicorn.Config(web_app, host="127.0.0.1", port=settings.web_port, log_level="warning")
    )
    try:
        await server.serve()
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()


if __name__ == "__main__":
    main()
