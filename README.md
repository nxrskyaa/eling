# Eling 🧠

**Eling** (Bahasa Indonesia: "ingat") adalah teman AI di Telegram yang benar-benar
ingat tentang kamu — kesukaanmu, rencanamu, hal-hal kecil yang kamu ceritakan —
bahkan antar sesi chat dan antar device. Memorinya disimpan di **Walrus Memory**
terdesentralisasi (bukan di server bot), jadi ingatanmu portabel dan milikmu sendiri.

Dibuat untuk hackathon **Walrus Session 8: Chatbots That Remember**.

## Arsitektur

```
Telegram user
     │  /start /memories /pair /bantuan + chat bebas
     ▼
  bot.py            ← wiring python-telegram-bot (asyncio)
     │  handle_message() → balasan
     │  save_memory_background() → fire-and-forget
     ▼
  brain.py          ← ElingBrain
     ├── recall()   → Walrus Memory (namespace eling:u<user_id>)
     ├── generate   → Gemini (google-genai)
     └── remember() → Walrus Memory (dedup otomatis)
```

Setiap user Telegram punya namespace memori terisolasi: `eling:u<user_id>`.

## Cara menjalankan

```bash
cd eling
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # lalu isi TELEGRAM_TOKEN, GEMINI_API_KEY, MEMWAL_*
python bot.py
```

Mode offline: kalau `MEMWAL_PRIVATE_KEY` kosong, bot otomatis pakai `MemWalMock`
(data hilang saat restart). Kalau `GEMINI_API_KEY` kosong, bot membalas pesan
"belum dikonfigurasi" alih-alih error.

Test: `python -m pytest tests/ -q` (offline, tanpa network/API key).

## Perintah

| Perintah   | Fungsi                                              |
|------------|-----------------------------------------------------|
| /start     | Kenalan + cara pakai                                |
| /memories  | Tampilkan semua ingatan tentang kamu (bernomor)     |
| /pair      | Bikin kode 6 digit (10 menit) untuk pairing web widget |
| /bantuan   | Daftar perintah (alias: /help)                      |

Chat biasa apa pun otomatis dianalisis dan fakta pentingnya disimpan ke memori.

## TODO

- [ ] Web widget (landing + chat) dengan pairing via kode `/pair`
- [ ] Verifikasi end-to-end dengan Walrus Memory relayer asli (bukan mock)
- [ ] Perintah /lupa ("lupakan X") memakai `memwal.forget`
- [ ] Ringkasan memori berkala (digest harian/mingguan)
- [ ] Multi-bahasa (sekarang fokus Bahasa Indonesia)
- [ ] Rate limiting & guardrails biaya Gemini
- [ ] Artikel submission hackathon (Medium/Inkray) + postingan X #WalrusMemory
