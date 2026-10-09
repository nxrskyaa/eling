// Score original untuk Eling demo video — disintesis murni dari kode, tanpa sample.
// 104 BPM, C mayor pentatonik, palet playful (pluck marimba-ish, soft kick, tanpa saw kasar).
// Cue frames dibaca dari src/audio/cues.json (dibangkitkan dari timeline.ts).
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const CUES = JSON.parse(readFileSync(join(here, 'cues.json'), 'utf8'));

const SR = 48000;
const FPS = 30;
const DUR = 45;
const N = SR * DUR;
const BPM = 104;
const SPB = 60 / BPM;
const f2b = (f) => f / FPS / SPB; // frame -> beat

const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 987654321;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x3fffffff) * 2 - 1;
};

function mixMono(sig, startSamp, vol, pan = 0) {
  const gL = Math.cos(((pan + 1) * Math.PI) / 4);
  const gR = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < sig.length; i++) {
    const n = startSamp + i;
    if (n >= N) break;
    L[n] += sig[i] * vol * gL;
    R[n] += sig[i] * vol * gR;
  }
}
const b2s = (b) => Math.floor(b * SPB * SR);
const sine = (ph) => Math.sin(2 * Math.PI * ph);
const tri = (ph) => 2 * Math.abs(2 * (ph % 1) - 1) - 1;

// ---- voices ----
function kick(tB, vol = 0.8) {
  const s0 = b2s(tB), len = Math.floor(SR * 0.3), sig = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (150 * Math.exp(-t * 28) + 40) / SR;
    sig[i] = sine(ph) * Math.exp(-t * 14);
  }
  mixMono(sig, s0, vol, 0);
}
function hat(tB, vol = 0.22, dur = 0.05) {
  const s0 = b2s(tB), len = Math.floor(SR * dur), sig = new Float32Array(len);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, x = rand();
    lp += 0.08 * (x - lp);
    sig[i] = (x - lp) * Math.exp(-t * 90);
  }
  mixMono(sig, s0, vol, 0);
}
function bass(tB, freq, beats = 4, vol = 0.45) {
  const s0 = b2s(tB), len = Math.floor(beats * SPB * SR), sig = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += freq / SR;
    sig[i] = tri(ph) * Math.exp(-t * 2.5) * Math.min(1, t * 60);
  }
  mixMono(sig, s0, vol, 0);
}
function pluck(tB, freq, vol = 0.38, pan = 0, decay = 9) {
  const s0 = b2s(tB), len = Math.floor(SR * 0.55), sig = new Float32Array(len);
  let p1 = 0, p2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    p1 += freq / SR;
    p2 += (freq * 1.004) / SR;
    sig[i] = (tri(p1) * 0.6 + tri(p2) * 0.4) * Math.exp(-t * decay) * Math.min(1, t * 400);
  }
  mixMono(sig, s0, vol, pan);
}
function pop(tB, freq = 880, vol = 0.5) {
  const s0 = b2s(tB), len = Math.floor(SR * 0.18), sig = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (freq * (1 + t * 6)) / SR;
    sig[i] = sine(ph) * Math.exp(-t * 30);
  }
  mixMono(sig, s0, vol, 0.1);
}
function whoosh(b0, b1, vol = 0.5) {
  const s0 = b2s(b0), len = b2s(b1) - s0, sig = new Float32Array(len);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / len, x = rand();
    const cutoff = 400 * Math.pow(6000 / 400, t);
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (x - lp);
    sig[i] = lp * Math.sin(Math.PI * t);
  }
  mixMono(sig, s0, vol, 0);
}
function stab(tB, freqs, vol = 0.5) {
  freqs.forEach((f, i) => pluck(tB, f, (vol / freqs.length) * 1.7, i % 2 ? 0.3 : -0.3, 6));
}
function subdrop(tB, vol = 0.9) {
  const s0 = b2s(tB), len = Math.floor(SR * 0.9), sig = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (110 * Math.exp(-t * 4) + 34) / SR;
    sig[i] = sine(ph) * Math.exp(-t * 3.5);
  }
  mixMono(sig, s0, vol, 0);
}

// ---- notes ----
const E5 = 659.25, G5 = 783.99, A5 = 880.0, C6 = 1046.5, D5 = 587.33, C5 = 523.25;
const D6 = 1174.7, G6 = 1568.0, C7 = 2093.0;
const C2 = 65.41, F2 = 87.31, G2 = 98.0;
const C4 = 261.63, E4 = 329.63, G4 = 392.0, F3 = 174.61, A3 = 220.0, D5n = 587.33;

// ---- arrangement ----
const THUD = f2b(CUES.thud); // 1.62
kick(THUD, 1.0);
hat(THUD, 0.2, 0.12);
subdrop(THUD, 0.35);

// intro plucks (sting)
pluck(3, E5, 0.45, -0.2);
pluck(4, G5, 0.45, 0.2);
pluck(5, A5, 0.5, -0.15);
pluck(6.5, C6, 0.55, 0.15);

// verse: 3 blok 8 beat (b8–32)
const blocks = [
  {at: 8, chords: [C2, F2], plucks: [C5, E5, G5, E5, A5, G5, E5, D5]},
  {at: 16, chords: [G2, C2], plucks: [C5, D5, E5, G5, A5, C6, A5, G5]},
  {at: 24, chords: [F2, G2], plucks: [E5, G5, A5, G5, E5, D5, C5, D5]},
];
for (const blk of blocks) {
  kick(blk.at, 0.7);
  kick(blk.at + 4, 0.7);
  if (blk.at < 24) {
    kick(blk.at + 2, 0.32);
    kick(blk.at + 6, 0.32);
  }
  for (let e = 0; e < 16; e++) hat(blk.at + e * 0.5, e % 2 ? 0.13 : 0.2);
  bass(blk.at, blk.chords[0], 4, 0.42);
  bass(blk.at + 4, blk.chords[1], 4, 0.42);
  blk.plucks.forEach((f, i) => pluck(blk.at + i, f, i === 0 ? 0.4 : 0.3, i % 2 ? 0.25 : -0.25));
}
// pop tiap brick mendarat (naik: D6 G6 C7)
pop(f2b(CUES.pop1), D6, 0.5);
pop(f2b(CUES.pop2), G6, 0.5);
pop(f2b(CUES.pop3), C7, 0.55);

// lift -> DROP
whoosh(f2b(CUES.whoosh), f2b(CUES.drop), 0.55);
for (let b = 30; b < 36; b += 0.5) hat(b, 0.14 + ((b - 30) / 6) * 0.26, 0.09);
[C5, E5, G5, C6, C5, E5, G5, C6].forEach((f, i) => pluck(34 + i * 0.25, f, 0.3, 0));
kick(34, 0.6);
kick(35, 0.7);

// DROP: brick recall mendarat
const DROP = f2b(CUES.drop);
kick(DROP, 1.0);
subdrop(DROP, 0.9);
stab(DROP, [C4, E4, G4, C5], 0.55);
hat(DROP, 0.3, 0.15);

// jawaban bot
stab(f2b(CUES.answer), [F3, A3, C4], 0.5);
kick(f2b(CUES.answer), 0.5);

// groove santai saat mengetik (b40–52)
kick(40, 0.6);
kick(44, 0.6);
kick(48, 0.6);
for (let b = 40; b < 52; b += 0.5) hat(b, 0.14);
bass(40, C2, 4, 0.4);
bass(44, G2, 4, 0.4);
bass(48, C2, 4, 0.4);
pluck(42, E5, 0.34, -0.2);
pluck(46, G5, 0.34, 0.2);
pluck(50, A5, 0.38, 0);

// verse 2 (b52–64)
for (let e = 0; e < 16; e++) hat(52 + e * 0.5, e % 2 ? 0.13 : 0.2);
kick(52, 0.7);
kick(56, 0.7);
kick(60, 0.7);
bass(52, C2, 4, 0.42);
bass(56, F2, 4, 0.42);
bass(60, G2, 4, 0.42);
[E5, G5, C6, G5, A5, E5, D5, C5].forEach((f, i) => pluck(52 + i, f, 0.3, i % 2 ? 0.25 : -0.25));
[D5, E5, G5, A5].forEach((f, i) => pluck(60 + i, f, 0.32, i % 2 ? -0.25 : 0.25));
pluck(63, C6, 0.4, 0.15);

// hening 1 beat (b64.9–66): tidak ada event; decay pendek memastikan bersih.

// CTA sting
const CTA = f2b(CUES.cta);
stab(CTA, [C4, E4, G4, D5n], 0.6);
kick(CTA, 0.5);
pluck(CTA, C7, 0.22, 0, 4);

// outro lembut
pluck(68, E5, 0.3, -0.2);
pluck(72, D5, 0.3, 0.2);
pluck(76, C5, 0.32, 0);
kick(72, 0.3);

// fade-out 1.2 detik terakhir + normalisasi
const fadeN = Math.floor(SR * 1.2);
for (let i = 0; i < fadeN; i++) {
  const g = 1 - i / fadeN;
  L[N - fadeN + i] *= g;
  R[N - fadeN + i] *= g;
}
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const data = new Int16Array(N * 2);
for (let i = 0; i < N; i++) {
  data[i * 2] = Math.max(-32768, Math.min(32767, Math.round(L[i] * norm * 32767)));
  data[i * 2 + 1] = Math.max(-32768, Math.min(32767, Math.round(R[i] * norm * 32767)));
}

// tulis WAV 16-bit stereo
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length * 2, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length * 2, 40);
const out = join(here, '..', '..', 'public', 'score.wav');
writeFileSync(out, Buffer.concat([header, Buffer.from(data.buffer)]));
console.log('score.wav written:', out, '| peak before norm:', peak.toFixed(3));
