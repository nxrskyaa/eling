// Menarik blok CUES dari timeline.ts -> src/audio/cues.json
// tanpa perlu compile TypeScript. Dijalankan sebelum node src/audio/score.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'timeline.ts'), 'utf8');
const m = src.match(/\/\/ CUES-JSON-START\n([\s\S]*?)\/\/ CUES-JSON-END/);
if (!m) throw new Error('blok CUES tidak ketemu di timeline.ts');
// Ubah "export const CUES = {...};" jadi object literal biasa
const body = m[1].replace('export const CUES =', '').trim().replace(/;$/, '');
const cues = new Function(`return (${body})`)();
const outDir = join(here, '..', 'src', 'audio');
mkdirSync(outDir, {recursive: true});
writeFileSync(join(outDir, 'cues.json'), JSON.stringify(cues, null, 2));
console.log('cues.json written:', JSON.stringify(cues));
