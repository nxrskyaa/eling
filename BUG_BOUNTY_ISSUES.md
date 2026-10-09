# DRAFT GitHub Issues — Bug Bounty, Walrus Session 8 (5 × $100)

> Paste ke: https://github.com/MystenLabs/MemWal/issues (New issue)
> Kedua issue ini grounded di SDK Python yang dibaca langsung (commit `3e0534e`,
> `packages/python-sdk-memwal/memwal/client.py`). Jangan klaim lebih dari yang
> diverifikasi — hapus bagian [TBD] kalau belum sempat repro sendiri.

---

## ISSUE 1 — `recall()` tanpa `max_distance` mengembalikan K hasil yang tidak relevan di namespace kecil

**Title:** `recall()`: default returns K nearest results even when none are relevant — consider a sensible default or DX warning

**Body:**

### Deskripsi
`recall(query, limit=10)` tanpa `max_distance` mengembalikan hingga K hasil
"terdekat" walau jaraknya besar dan tidak relevan. Di namespace kecil (kasus
umum bot baru / testing), hampir setiap recall mengembalikan fakta yang
tidak nyambung, dan developer harus sadar sendiri untuk menambahkan filter.

### Repro
1. Namespace baru, `remember()` satu fakta: "User is allergic to peanuts"
2. `recall("what is the capital of France?")` — tanpa `max_distance`
3. Hasil: fakta alergi kacang tetap dikembalikan (distance tinggi), sebagai
   satu-satunya "nearest" result

### Ekspektasi
- Minimal: contoh quick-start / docstring menekankan `max_distance` sebagai
  wajib-praktis, bukan opsional yang tersembunyi.
- Ideal: default threshold yang masuk akal, atau warning ketika recall
  mengembalikan hasil dengan distance sangat tinggi di namespace kecil.

### Kenapa ini penting
Tema hackathon ini "recall the right things at the right time". Tanpa
threshold, pola "recall → inject ke prompt" (pola yang didokumentasikan)
menyuntikkan fakta tidak relevan ke LLM, yang lalu mengarang jawaban dari
fakta tersebut. Saya menemukan ini saat membangun bot Telegram untuk
Session 8 — fix di sisi aplikasi (filter client-side `distance < 0.8`) mudah,
tapi seharusnya SDK tidak membuat pola default-nya berbahaya.

### Referensi kode
`packages/python-sdk-memwal/memwal/client.py` — `recall()`:
`max_distance: Optional[float] = None` — "Optional client-side relevance
threshold", tidak ada default, dan tanpa itu semua K hasil dikembalikan apa adanya.

---

## ISSUE 2 — `remember()` tidak idempoten antar-sesi: fakta sama → entri ganda

**Title:** `remember()`: duplicate facts across sessions create duplicate entries — no server-side dedup/upsert path

**Body:**

### Deskripsi
`remember()` adalah append-only. Fakta yang sama disimpan dua kali (sangat
umum: ekstraksi fakta dari percakapan berjalan dua kali, atau user
mengulang info di sesi berbeda) → dua entri blob terpisah yang dua-duanya
muncul di `recall`.

### Yang sudah ada vs yang kurang
SDK punya `idempotency_key` — TAPI hanya menduplikasi remember yang
*in-flight* dalam satu instance client (`_pending_remember_keys`,
`request_identity = f"{namespace}\0{text}"`). Setelah proses restart, atau
fakta yang diekstrak ulang di sesi berikutnya, proteksi ini hilang total.
Tidak ada path `upsert` / dedup semantik di sisi server.

### Repro
1. `remember("User is allergic to peanuts")`, tunggu selesai
2. Restart proses (atau panggil dari instance client lain)
3. `remember("User is allergic to peanuts")` lagi
4. `recall("allergies")` → dua entri identik

### Ekspektasi
- Minimal: dokumentasikan secara eksplisit bahwa dedup hanya berlaku untuk
  in-flight remembers dalam satu instance, supaya developer tidak mengira
  `idempotency_key` melindungi lintas-sesi.
- Ideal: opsi `dedupe=True` / `upsert` di `remember()` — recall dulu dengan
  threshold ketat, skip/replace kalau fakta (hampir) identik sudah ada.

### Kenapa ini penting
Bot memori yang baik tidak boleh "mengingat dua kali". Saat ini setiap
developer harus membangun dedup sendiri (saya melakukannya di bot Session 8:
recall dulu, skip kalau `distance < 0.25`) — artinya pola yang benar tidak
didukung SDK, dan bot yang mengikuti quick-start akan mengakumulasi duplikat
tanpa disadari.

### Referensi kode
`packages/python-sdk-memwal/memwal/client.py` — `remember()`:
idempotency hanya via `self._pending_remember_keys` (in-memory, per-instance).

---

### Checklist sebelum submit
- [ ] Bikin akun GitHub (kalau belum) dan buka https://github.com/MystenLabs/MemWal/issues
- [ ] Paste Issue 1 → label `bug`/`DX` kalau tersedia → simpan URL issue
- [ ] Paste Issue 2 → simpan URL issue
- [ ] URL kedua issue dipakai sebagai bukti di form Airtable (Bug Bounty) dan boleh disebut di artikel
