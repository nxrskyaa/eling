# DRAFT ARTIKEL — Eling: Bot yang Tidak Lupa (Walrus Session 8)

> Target: 500–800 kata, publish di Medium/Inkray. Nada: jujur > polished.
> Bagian [EVIDENCE] diisi setelah 3 user testing.

---

## Eling: ketika chatbot akhirnya ingat siapa kamu

Kebanyakan chatbot menderita amnesia total. Tutup chat, buka lagi besok — dia
tidak tahu namamu, tidak ingat alergimu, tidak tahu deadline-mu. Setiap sesi
mulai dari nol.

Eling ("ingat" dalam bahasa Jawa) adalah teman AI berbahasa Indonesia yang
dibangun untuk satu hal: **tidak lupa**. Ceritakan alergi kacangmu hari ini,
tanya minggu depan "makanan apa yang aman buat gue?" — dia menjawab dari
ingatan, bukan dari tebakan. Dan ingatan itu ikut ke mana pun kamu chat:
mulai di Telegram, lanjut di web widget, Eling tetap orang (bot?) yang sama.

Dibangun untuk Walrus Session 8: Chatbots That Remember, dengan Walrus Memory
sebagai lapisan memorinya dan Gemini sebagai otaknya.

## Cara kerja memorinya

Setiap pesan masuk melewati tiga langkah:

1. **Recall dulu, jawab kemudian.** Sebelum menjawab, Eling
   me-recall memori relevan dari Walrus Memory (`recall(query, namespace,
   max_distance=0.8)`), lalu menyuntikkannya ke system prompt sebagai daftar
   fakta — lengkap dengan instruksi keras: *jangan pernah mengarang ingatan
   yang tidak ada di daftar*.
2. **Satu namespace per user** (`eling:u{telegram_id}`). Isolasi ini
   bawaan Walrus Memory: recall di namespace A tidak akan pernah
   memunculkan entri namespace B. Satu bot, banyak user, masing-masing
   punya ingatannya sendiri.
3. **Simpan di background.** Setelah menjawab, `analyze()` mengekstrak
   fakta dari percakapan, lalu setiap fakta dicek duplikasinya (skip kalau
   distance < 0.25 — lihat gotcha #1) sebelum `remember_and_wait()`.

Web widget memakai kode pairing 6 digit dari perintah `/pair` di Telegram,
lalu sesi web dipetakan ke namespace yang sama. Itulah momen lintas-device:
memori yang ditulis di HP bisa dibaca di browser.

## Before / after

[EVIDENCE: screenshot berdampingan — bot tanpa memori ("Maaf, aku tidak
tahu kamu alergi apa") vs Eling ("Kacang jangan — kamu alergi kacang, kamu
bilang tanggal X").]

[EVIDENCE: screenshot /memories — daftar 10+ fakta per user, 3 user.]

[EVIDENCE: screenshot lintas-device — fakta diceritakan di Telegram,
ditanyakan lewat web widget, dijawab benar.]

## Tiga gotcha Walrus Memory yang saya temukan

1. **`remember()` itu append-only, bukan upsert.** Simpan fakta yang sama
   dua kali → dua entri dobel yang dua-duanya muncul di recall. Solusi:
   dedup di sisi aplikasi (recall dulu, skip kalau distance < 0.25).
2. **Recall tanpa threshold = filler.** Namespace kecil tetap mengembalikan
   K hasil "terdekat" walau tidak relevan. Filter `distance < 0.8` itu wajib,
   dan angkanya perlu dikalibrasi ke datamu sendiri.
3. **Indexing lag.** `remember()` return sebelum fakta bisa di-recall.
   Untuk alur yang butuh konsistensi langsung (simpan → /memories),
   pakai varian `*AndWait`.

## Coba sendiri

Repo publik + setup instructions: [LINK REPO]
Jalankan: `pip install -r requirements.txt`, isi `.env`, `python bot.py`.
Butuh: token bot Telegram (@BotFather), Gemini API key gratis
(aistudio.google.com), dan delegate key + account ID dari
memory.walrus.xyz.

---

*Checklist sebelum publish: isi [EVIDENCE], tambah link repo, ~600 kata,
share di X tag @WalrusProtocol dengan #WalrusMemory.*
