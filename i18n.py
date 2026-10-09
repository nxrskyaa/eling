"""String UI Eling dalam 3 bahasa: Indonesia, English, Mandarin (Simplified).

t(lang, key, **kwargs) -> string terformat. Semua bahasa WAJIB punya key yang sama
(dicek oleh tests/test_i18n.py).
"""
from __future__ import annotations

# kode -> label tombol picker
SUPPORTED_LANGS: dict[str, str] = {
    "id": "🇮🇩 Bahasa Indonesia",
    "en": "🇬🇧 English",
    "zh": "🇨🇳 中文",
}

DEFAULT_LANG = "id"

STRINGS: dict[str, dict[str, str]] = {
    "id": {
        "pick_lang": "Silakan pilih bahasamu 🙂\nPlease choose your language 🙂\n请选择你的语言 🙂",
        "start_intro": (
            "Halo {name}! Aku *Eling* — teman AI yang ingat segalanya tentang kamu. 🧠\n\n"
            "Ceritain aja apa pun: kesukaanmu, rencanamu, hal random — aku bakal mengingatnya, "
            "bahkan kalau kamu chat lagi besok atau dari device lain.\n\n"
            "*Cara pakai:*\n"
            "• Chat aja kayak biasa, aku otomatis mengingat fakta penting.\n"
            "• /memories — lihat semua yang aku ingat tentang kamu.\n"
            "• /pair — bikin kode pairing buat hubungin ke web widget.\n"
            "• /language — ganti bahasa.\n"
            "• /bantuan — lihat daftar perintah.\n\n"
            "Yuk kenalan! Siapa namamu dan apa yang lagi kamu suka akhir-akhir ini?"
        ),
        "memories_empty": (
            "Aku belum punya ingatan tentang kamu nih. Ceritain sesuatu dulu yuk, "
            "misalnya makanan favoritmu atau rencanamu minggu ini! 😊"
        ),
        "memories_title": "Ini semua yang aku ingat tentang kamu:",
        "pair_msg": (
            "Kode pairing kamu: *{code}*\n\n"
            "Masukkan kode ini di web widget Eling untuk menghubungkan "
            "sesi web dengan akun Telegram-mu. Kode berlaku 10 menit dan hanya bisa dipakai sekali."
        ),
        "help_text": (
            "*Perintah Eling:*\n"
            "/start — kenalan & mulai ngobrol\n"
            "/memories — lihat semua ingatanku tentang kamu\n"
            "/pair — bikin kode pairing buat web widget\n"
            "/language — ganti bahasa\n"
            "/bantuan — pesan ini\n\n"
            "Selain itu, chat aja bebas — aku otomatis mengingat hal-hal penting! 🧠"
        ),
        "not_configured": (
            "Waduh, otakku (Gemini) belum dikonfigurasi nih. "
            "Minta admin bot ini buat isi GEMINI_API_KEY dulu ya 🙏"
        ),
        "error_thinking": "Duh, aku lagi error mikir nih. Coba kirim lagi pesanmu sebentar ya 🙏",
        "error_empty": "Hmm, aku kehabisan kata-kata nih. Coba tanya lagi dengan cara lain ya!",
        "lang_set": "Bahasa diganti ke Bahasa Indonesia 🇮🇩",
        "memories_none": "Belum ada ingatan.",
    },
    "en": {
        "pick_lang": "Silakan pilih bahasamu 🙂\nPlease choose your language 🙂\n请选择你的语言 🙂",
        "start_intro": (
            "Hi {name}! I'm *Eling* — an AI friend who remembers everything about you. 🧠\n\n"
            "Tell me anything: your likes, your plans, random stuff — I'll remember it, "
            "even if you chat again tomorrow or from another device.\n\n"
            "*How to use:*\n"
            "• Just chat normally, I automatically remember important facts.\n"
            "• /memories — see everything I remember about you.\n"
            "• /pair — generate a pairing code to connect the web widget.\n"
            "• /language — change language.\n"
            "• /bantuan — list of commands.\n\n"
            "Let's get to know each other! What's your name and what are you into lately?"
        ),
        "memories_empty": (
            "I don't have any memories about you yet. Tell me something first — "
            "like your favorite food or your plans this week! 😊"
        ),
        "memories_title": "Here's everything I remember about you:",
        "pair_msg": (
            "Your pairing code: *{code}*\n\n"
            "Enter this code in the Eling web widget to link your web session "
            "with your Telegram account. The code lasts 10 minutes and can only be used once."
        ),
        "help_text": (
            "*Eling commands:*\n"
            "/start — intro & start chatting\n"
            "/memories — see everything I remember about you\n"
            "/pair — generate a pairing code for the web widget\n"
            "/language — change language\n"
            "/bantuan — this message\n\n"
            "Otherwise just chat freely — I automatically remember the important stuff! 🧠"
        ),
        "not_configured": (
            "Oops, my brain (Gemini) isn't configured yet. "
            "Ask this bot's admin to set GEMINI_API_KEY first 🙏"
        ),
        "error_thinking": "Ugh, I'm having trouble thinking right now. Try sending your message again in a bit 🙏",
        "error_empty": "Hmm, I'm out of words. Try asking in a different way!",
        "lang_set": "Language switched to English 🇬🇧",
        "memories_none": "No memories yet.",
    },
    "zh": {
        "pick_lang": "Silakan pilih bahasamu 🙂\nPlease choose your language 🙂\n请选择你的语言 🙂",
        "start_intro": (
            "你好 {name}！我是 *Eling* —— 一个记得关于你的一切的 AI 朋友。🧠\n\n"
            "随便聊聊吧：你的喜好、你的计划、任何琐事——我都会记住，"
            "即使你明天再来聊，或者换个设备。\n\n"
            "*使用方法：*\n"
            "• 像平时一样聊天，我会自动记住重要的事情。\n"
            "• /memories —— 查看我记得的关于你的一切。\n"
            "• /pair —— 生成配对码，连接网页小部件。\n"
            "• /language —— 切换语言。\n"
            "• /bantuan —— 查看命令列表。\n\n"
            "来认识一下吧！你叫什么名字，最近喜欢什么？"
        ),
        "memories_empty": "我还没有关于你的记忆。先告诉我一些事情吧，比如你最喜欢的食物或这周的计划！😊",
        "memories_title": "以下是我记得的关于你的一切：",
        "pair_msg": (
            "你的配对码：*{code}*\n\n"
            "在 Eling 网页小部件中输入此码，将网页会话与你的 Telegram 账号连接。"
            "配对码有效期 10 分钟，只能使用一次。"
        ),
        "help_text": (
            "*Eling 命令：*\n"
            "/start —— 介绍并开始聊天\n"
            "/memories —— 查看我记得的关于你的一切\n"
            "/pair —— 生成网页小部件配对码\n"
            "/language —— 切换语言\n"
            "/bantuan —— 本消息\n\n"
            "除此之外，随便聊——我会自动记住重要的事情！🧠"
        ),
        "not_configured": "哎呀，我的大脑（Gemini）还没有配置。请让这个机器人的管理员先设置 GEMINI_API_KEY 🙏",
        "error_thinking": "唔，我现在思考有点卡。稍后再发一次消息试试 🙏",
        "error_empty": "嗯，我一时词穷了。换个方式再问一次吧！",
        "lang_set": "语言已切换为中文 🇨🇳",
        "memories_none": "还没有记忆。",
    },
}

# System prompt persona per bahasa untuk Gemini.
SYSTEM_PROMPTS: dict[str, dict[str, str]] = {
    "id": {
        "persona": (
            "Kamu adalah Eling, teman AI yang ingat segalanya tentang user ini. "
            "Kamu ngobrol santai, akrab, dan hangat dalam Bahasa Indonesia, kayak temen deket. "
            "Jawabanmu ringkas tapi bermakna."
        ),
        "mem_header": "Hal yang kamu ingat tentang user ini:",
        "mem_empty": "(Belum ada ingatan tersimpan tentang user ini.)",
        "rules": (
            "Aturan:\n"
            "1. Pakai ingatan di atas secara natural kalau relevan dengan obrolan — jangan dipaksa semua sekaligus.\n"
            "2. JANGAN PERNAH mengarang ingatan yang tidak ada di daftar. Kalau tidak ada di daftar, "
            "bilang saja kamu belum tahu / belum ingat, jangan nebak.\n"
            "3. Kalau user cerita fakta baru tentang dirinya (nama, kesukaan, rencana, dll), "
            "respon seolah kamu akan mengingatnya baik-baik."
        ),
    },
    "en": {
        "persona": (
            "You are Eling, an AI friend who remembers everything about this user. "
            "You chat casually, warmly and friendly in English, like a close friend. "
            "Your answers are concise but meaningful."
        ),
        "mem_header": "Things you remember about this user:",
        "mem_empty": "(No memories stored about this user yet.)",
        "rules": (
            "Rules:\n"
            "1. Use the memories above naturally when relevant to the conversation — don't force all of them at once.\n"
            "2. NEVER invent memories that are not in the list. If it's not in the list, "
            "just say you don't know / don't remember yet, don't guess.\n"
            "3. When the user shares new facts about themselves (name, likes, plans, etc.), "
            "respond as if you'll remember them well."
        ),
    },
    "zh": {
        "persona": (
            "你是 Eling，一个记得关于这位用户一切的 AI 朋友。"
            "你用中文像亲密朋友一样轻松、热情、友好地聊天。回答简洁但有意义。"
        ),
        "mem_header": "你记得的关于这位用户的事情：",
        "mem_empty": "(还没有关于这位用户的记忆。)",
        "rules": (
            "规则：\n"
            "1. 在相关时自然地使用上面的记忆——不要一次强行用完。\n"
            "2. 绝不编造列表中没有的记忆。如果不在列表中，就说你还不知道/还不记得，不要猜测。\n"
            "3. 当用户分享关于自己的新事实（名字、喜好、计划等）时，回应得像你会好好记住一样。"
        ),
    },
}


def t(lang: str, key: str, **kwargs: object) -> str:
    """Ambil string UI untuk bahasa & key, format dengan kwargs."""
    lang = lang if lang in STRINGS else DEFAULT_LANG
    template = STRINGS[lang].get(key, STRINGS[DEFAULT_LANG].get(key, key))
    try:
        return template.format(**kwargs)
    except (KeyError, IndexError):
        return template


def system_prompt(lang: str, memories: list[tuple[str, float]]) -> str:
    """Bangun system instruction Gemini sesuai bahasa user."""
    lang = lang if lang in SYSTEM_PROMPTS else DEFAULT_LANG
    sp = SYSTEM_PROMPTS[lang]
    if memories:
        bullet = "\n".join(f"- {text}" for text, _ in memories)
    else:
        bullet = f"- {sp['mem_empty']}"
    return f"{sp['persona']}\n\n{sp['mem_header']}\n{bullet}\n\n{sp['rules']}"
