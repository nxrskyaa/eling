# REVIEW — Eling demo video (portrait 1080×1920, 45s)

## Stills QA per scene
- **S1 Sting** — f14: brick jatuh, bayangan muncul ✓. f30: brick mendarat + debu ✓.
  f90 AWAL: avatar webp background gelap tidak transparan → kotak foto di atas cream ✗.
  FIX: avatar dibingkai brick-frame (border tinta + hard shadow) ala landing page; tambah baseplate bawah.
  f90 ULANG: komposisi seimbang ✓.
- **S2 Facts** — f160/f280/f420. AWAL: user bubble rata kiri (alignSelf tak efek karena wrapper Pop bukan flex) ✗.
  FIX: wrapper Pop jadi `display:flex; flex-direction:column`. ULANG f420: chat benar (user kanan, bot kiri), 3 brick di dinding ✓.
- **S3 Money** — f580/610/680/810. f610: brick recall + glow kuning dramatis ✓.
  AWAL: chip recall menumpuk bubble mengetik (f680) ✗; label "ingatan tersimpan" tertutup brick ✗.
  FIX: chip pindah y 700→770; label ke top:1570.
- **S4 Memories** — f960 terlalu kosong sebelum brick jatuh ✗. FIX: dropF 80/105/130 → 50/72/94; pills 165→140.
  f1110: 3 brick besar + flag pills 🇮🇩🇬🇧🇨🇳 render sempurna + caption ✓.
- **S5 CTA** — f1180/f1260: komposisi terbaca; gap 500px antara plate & baseplate ✗.
  FIX: 3 mini-brick melayang (gentle sine) di y~1450.

## Critique pass (full watch)
Render penuh 1350f ditonton via 8 frame sampel (f60/200/420/623/750/1000/1200/1330):
- f60: sting — avatar frame + brick + ELING terbaca bahkan di thumbnail 360px ✓
- f200–420: 3 bubble → 3 brick → dinding, narasi jelas ✓
- f623 (DROP): brick recall + glow kuning mendarat tepat saat user bertanya; tray label "ingatan tersimpan" kini terlihat ✓
- f750: jawaban bot mengetik + chip "alergi kacang · 7 hari lalu" sebagai tag ✓
- f1000: /memories + 3 brick besar + flags ✓
- f1200→1330: CTA cascade (avatar → tombol → handle → plate → brick melayang), hold akhir 4 detik ✓
- Audio final (die ekstrak dari MP4): drop 20s rms 0.118, hening 37s rms 0.000, CTA 38s ✓
Skor: 8.5/10. Tidak ada re-render needed — satu-satunya runtime error (BLUE undefined di Cta)
tertangkap di frame 1140 dan sudah di-fix sebelum render final ini.

## Render
- Master: `out/eling-demo-portrait.mp4` (1080×1920, 30fps, H.264 + AAC)
- Web ringan: `out/eling-demo-portrait-web.mp4` (720p, crf 26)
- Re-render satu perintah: `cd remotion && npx remotion render src/index.tsx Film ../out/eling-demo-portrait.mp4`

## Catatan environment
- Chromium bawaan `/opt/meta-chromium/chrome` (v152) memblokir navigasi localhost
  (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`) walau Remotion sudah disable flag lama.
  Solusi: biarkan Remotion download headless-shell sendiri (`npx remotion browser ensure`);
  baris `setBrowserExecutable` di remotion.config.ts di-disable sementara.
- Font Google fetch gagal dari browser (`ERR_SSL_PROTOCOL_ERROR` via egress proxy).
  Solusi: Fredoka + Nunito (latin) di-download via curl, di-inline base64 di `src/gen/fonts.css`.
