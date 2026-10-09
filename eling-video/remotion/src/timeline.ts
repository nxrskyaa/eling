// Single source of truth: scene boundaries + music cues.
// score.mjs membaca cue yang sama via scripts/dump-cues.mjs -> src/audio/cues.json
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 1350; // 45 detik

export const SCENES = [
  {id: 'sting', start: 0, duration: 120},      // 0–4s   logo sting
  {id: 'facts', start: 120, duration: 360},    // 4–16s  3 fakta -> brick -> dinding
  {id: 'money', start: 480, duration: 420},    // 16–30s MONEY SHOT recall
  {id: 'memories', start: 900, duration: 240}, // 30–38s /memories + pills bahasa
  {id: 'cta', start: 1140, duration: 210},     // 38–45s CTA
] as const;

// CUES-JSON-START
export const CUES = {
  thud: 28,      // brick jatuh "gedebuk" (sting)
  pop1: 208,     // brick 1 mendarat di dinding
  pop2: 294,     // brick 2 mendarat
  pop3: 381,     // brick 3 mendarat
  whoosh: 470,   // lift menuju money shot
  drop: 623,     // DROP: brick recall mendarat di chat
  answer: 675,   // chord: jawaban bot muncul
  silence: 1123, // hening 1 beat sebelum CTA
  cta: 1142,     // CTA sting
};
// CUES-JSON-END

export const BEAT = 60 / 104; // detik per beat @104 BPM
export const BEAT_FRAMES = BEAT * FPS; // 17.31
