import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, ORANGE, BLUE, YELLOW} from '../components/theme';
import {FREDOKA, NUNITO} from '../components/fonts';
import {Brick} from '../components/Brick';
import {Bubble, Phone} from '../components/Phone';

// Scene 4 — Memories (f900–1140, lokal 0–240):
// user ketik /memories -> 3 brick besar jatuh tersusun -> pills 3 bahasa pop.
const WALL_BRICKS = [
  {color: ORANGE, label: '🥜 alergi kacang', dropF: 50},
  {color: BLUE, label: '☕ suka kopi tubruk', dropF: 72},
  {color: YELLOW, label: '🐱 kucing: Momo', dropF: 94},
];
const ROW_Y = [1150, 1300, 1450];

const Pop: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 240}});
  const scale = interpolate(s, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at) return null;
  return <div style={{display: 'flex', flexDirection: 'column', transform: `scale(${scale})`, transformOrigin: 'center'}}>{children}</div>;
};

export const Memories: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const capP = interpolate(frame, [8, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      {/* caption */}
      <div style={{position: 'absolute', top: 84, width: '100%', textAlign: 'center', opacity: capP}}>
        <span style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 44, color: INK}}>
          Ketik <span style={{background: INK, color: CREAM, padding: '4px 18px', borderRadius: 12}}>/memories</span>
        </span>
      </div>

      {/* phone kecil */}
      <div style={{position: 'absolute', left: 307, top: 180, transform: 'scale(0.75)', transformOrigin: 'top left'}}>
        <Phone>
          <Pop at={15}>
            <Bubble from="user">/memories</Bubble>
          </Pop>
          <Pop at={55}>
            <Bubble from="bot">
              <span style={{fontSize: 26}}>Ini semua yang kuingat 🧠👇</span>
            </Bubble>
          </Pop>
        </Phone>
      </div>

      {/* dinding brick berjatuhan */}
      {WALL_BRICKS.map((b, i) => {
        const f = frame - b.dropF;
        if (f < 0) return null;
        const t = interpolate(f, [0, 26], [0, 1], {easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const y = -260 + (ROW_Y[i] + 260) * t;
        const bounce = f > 26 ? Math.abs(Math.sin((f - 26) * 0.35)) * 30 * Math.exp(-(f - 26) / 9) : 0;
        const settled = f >= 26;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 260,
              top: (settled ? ROW_Y[i] : y) - bounce,
              opacity: interpolate(f, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            <Brick
              color={b.color}
              width={560}
              height={110}
              studs={5}
              label={b.label}
              fontSize={38}
              labelColor={b.color === BLUE ? '#fff' : INK}
            />
          </div>
        );
      })}

      {/* pills bahasa */}
      {[0, 1, 2].map((i) => {
        const at = 140 + i * 12;
        const s = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 200}});
        const scale = interpolate(s, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        if (frame < at) return null;
        const flags = ['🇮🇩', '🇬🇧', '🇨🇳'];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 300 + i * 170,
              top: 1640,
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: CREAM2,
              border: `6px solid ${INK}`,
              boxShadow: `6px 6px 0 ${INK}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              transform: `scale(${scale})`,
            }}
          >
            {flags[i]}
          </div>
        );
      })}
      {frame >= 182 && (
        <div style={{position: 'absolute', top: 1800, width: '100%', textAlign: 'center', opacity: interpolate(frame, [182, 196], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <span style={{fontFamily: NUNITO, fontWeight: 800, fontSize: 34, color: INK_SOFT}}>
            ngobrol dalam 3 bahasa
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
