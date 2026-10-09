"""Wiring Telegram untuk Eling: command handler + message handler -> ElingBrain."""
from __future__ import annotations

import asyncio
import logging
import secrets
import time

from telegram import Update
from telegram.constants import ChatAction, ParseMode
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from brain import ElingBrain, create_gemini_client, create_memwal_client
from config import load_settings
from i18n import SUPPORTED_LANGS, t
from langstore import get_lang, has_lang, set_lang

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


def _lang(update: Update) -> str:
    return get_lang(update.effective_user.id)


def _lang_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        InlineKeyboardButton(label, callback_data=f"lang:{code}")
        for code, label in SUPPORTED_LANGS.items()
    ]
    return InlineKeyboardMarkup([buttons])


async def _send_intro(update: Update, context: ContextTypes.DEFAULT_TYPE, lang: str) -> None:
    name = update.effective_user.first_name or "kamu"
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=t(lang, "start_intro", name=name),
        parse_mode=ParseMode.MARKDOWN,
    )


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    if not has_lang(user_id):
        # User baru: kasih picker bahasa dulu.
        await update.message.reply_text(
            t("id", "pick_lang"), reply_markup=_lang_keyboard()
        )
        return
    await _send_intro(update, context, _lang(update))


async def on_lang_pick(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Tombol bahasa di-inline keyboard diklik."""
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    code = (query.data or "").split(":", 1)[-1]
    if not set_lang(user_id, code):
        return
    # Hapus pesan picker biar chat rapi, lalu kirim intro bahasa terpilih.
    try:
        await query.delete_message()
    except Exception:
        pass
    await context.bot.send_message(
        chat_id=update.effective_chat.id, text=t(code, "lang_set")
    )
    await _send_intro(update, context, code)


async def cmd_language(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        t(_lang(update), "pick_lang"), reply_markup=_lang_keyboard()
    )


async def cmd_memories(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    lang = _lang(update)
    brain = _brain(context)
    memories = await brain.list_memories(update.effective_user.id)
    if not memories:
        await update.message.reply_text(t(lang, "memories_empty"))
        return
    lines = [f"{i}. {text}" for i, text in enumerate(memories, start=1)]
    await update.message.reply_text(t(lang, "memories_title") + "\n\n" + "\n".join(lines))


async def cmd_pair(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    lang = _lang(update)
    _prune_pair_codes()
    code = f"{secrets.randbelow(900_000) + 100_000:06d}"
    PAIR_CODES[code] = (update.effective_user.id, time.time() + PAIR_TTL_SECONDS)
    await update.message.reply_text(
        t(lang, "pair_msg", code=code),
        parse_mode=ParseMode.MARKDOWN,
    )


async def cmd_bantuan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        t(_lang(update), "help_text"), parse_mode=ParseMode.MARKDOWN
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
    # Jangan log URL HTTP: token bot Telegram ada di path URL Bot API.
    logging.getLogger("httpx").setLevel(logging.WARNING)
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
        lang_getter=get_lang,
    )

    # Timeout longgar: request pertama lewat egress proxy bisa ~11 detik
    # (cold TLS), request berikutnya <1 detik.
    from telegram.request import HTTPXRequest

    tg_request = HTTPXRequest(
        connect_timeout=30.0, read_timeout=30.0, write_timeout=30.0, pool_timeout=10.0
    )
    app = Application.builder().token(settings.telegram_token).request(tg_request).build()
    app.bot_data["brain"] = brain

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CallbackQueryHandler(on_lang_pick, pattern=r"^lang:(id|en|zh)$"))
    app.add_handler(CommandHandler(["language", "bahasa"], cmd_language))
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
