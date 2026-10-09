import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, ORANGE, BLUE, YELLOW} from '../components/theme';
import {FREDOKA} from '../components/fonts';
import {Brick} from '../components/Brick';
import {Bubble, Phone} from '../components/Phone';

// Scene 2 — Facts (f120–480, lokal 0–360):
// 3 bubble chat user -> tiap fakta jadi brick yang terbang ke dinding ingatan.
const FACTS = [
  {text: 'aku alergi kacang 🥜', label: '🥜 alergi kacang', color: ORANGE, bubbleF: 15, botF: 40, flyF0: 60, landF: 88, slot: 0},
  {text: 'aku suka kopi tubruk ☕', label: '☕ kopi tubruk', color: BLUE, bubbleF: 105, botF: 130, flyF0: 150, landF: 174, slot: 1},
  {text: 'kucingku namanya Momo 🐱', label: '🐱 Momo', color: YELLOW, bubbleF: 195, botF: 220, flyF0: 237, landF: 261, slot: 2},
];
const SLOT_X = [230, 540, 850];
const SLOT_Y = 1560;
const FLY_FROM: [number, number] = [660, 470];

const flyPos = (f: number, f0: number, f1: number, toX: number) => {
  const t = interpolate(f, [f0, f1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = Easing.inOut(Easing.quad)(t);
  return {
    x: FLY_FROM[0] + (toX - FLY_FROM[0]) * e,
    y: FLY_FROM[1] + (SLOT_Y - FLY_FROM[1]) * e - Math.sin(t * Math.PI) * 330,
    t,
  };
};

const Pop: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 240}});
  const scale = interpolate(s, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at) return null;
  return <div style={{display: 'flex', flexDirection: 'column', transform: `scale(${scale})`, transformOrigin: 'center'}}>{children}</div>;
};

export const Facts: React.FC = () => {
  const frame = useCurrentFrame();

  const capP = interpolate(frame, [8, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wallP = interpolate(frame, [90, 104], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // bounce perayaan saat semua brick mendarat
  const cheer = frame >= 280 ? Math.sin((frame - 280) * 0.3) * 14 * Math.exp(-(frame - 280) / 14) : 0;

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      {/* caption atas */}
      <div style={{position: 'absolute', top: 96, width: '100%', textAlign: 'center', opacity: capP}}>
        <span style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 44, color: INK_SOFT}}>
          💬 Semua yang kamu ceritakan…
        </span>
      </div>

      {/* phone */}
      <div style={{position: 'absolute', left: 230, top: 200}}>
        <Phone>
          {FACTS.map((fc, i) => (
            <React.Fragment key={i}>
              <Pop at={fc.bubbleF}>
                <Bubble from="user">{fc.text}</Bubble>
              </Pop>
              <Pop at={fc.botF}>
                <Bubble from="bot">
                  <span style={{fontSize: 26}}>Noted! Ku ingat 🧠</span>
                </Bubble>
              </Pop>
            </React.Fragment>
          ))}
        </Phone>
      </div>

      {/* label dinding */}
      <div style={{position: 'absolute', top: 1430, width: '100%', textAlign: 'center', opacity: wallP}}>
        <span style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 44, color: INK}}>
          🧠 …tidak pernah hilang.
        </span>
      </div>

      {/* baseplate dinding */}
      {frame >= 80 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: CREAM2,
            borderTop: `6px solid ${INK}`,
            opacity: interpolate(frame, [80, 94], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        />
      )}

      {/* brick yang sedang terbang */}
      {FACTS.map((fc, i) => {
        if (frame < fc.flyF0 - 10 || frame > fc.landF) return null;
        const {x, y} = flyPos(frame, fc.flyF0, fc.landF, SLOT_X[fc.slot]);
        const grow = interpolate(frame, [fc.flyF0 - 10, fc.flyF0 + 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const rot = interpolate(frame, [fc.flyF0, fc.landF], [-14, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={`fly${i}`}
            style={{
              position: 'absolute',
              left: x - 140,
              top: y - 60,
              transform: `scale(${0.35 + 0.65 * grow}) rotate(${rot}deg)`,
              opacity: grow,
            }}
          >
            <Brick color={fc.color} width={280} height={96} label={fc.label} fontSize={30} labelColor={fc.color === BLUE ? '#fff' : INK} />
          </div>
        );
      })}

      {/* brick yang sudah mendarat di dinding */}
      {FACTS.map((fc, i) => {
        if (frame < fc.landF) return null;
        const since = frame - fc.landF;
        const bounce = Math.abs(Math.sin(since * 0.4)) * 26 * Math.exp(-since / 8);
        const dustP = Math.min(1, since / 16);
        return (
          <React.Fragment key={`wall${i}`}>
            {since < 16 && (
              <div
                style={{
                  position: 'absolute',
                  left: SLOT_X[fc.slot] - 100,
                  top: SLOT_Y - 40,
                  width: 200,
                  height: 40,
                  borderRadius: '50%',
                  background: INK,
                  opacity: 0.12 * (1 - dustP),
                  transform: `scaleX(${0.5 + dustP})`,
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                left: SLOT_X[fc.slot] - 140,
                top: SLOT_Y - 70 - bounce + (i === 2 ? cheer : i === 1 ? -cheer : cheer * 0.5),
              }}
            >
              <Brick color={fc.color} width={280} height={96} label={fc.label} fontSize={30} labelColor={fc.color === BLUE ? '#fff' : INK} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
