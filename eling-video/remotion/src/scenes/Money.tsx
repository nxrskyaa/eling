import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, ORANGE, BLUE, YELLOW, GREEN} from '../components/theme';
import {FREDOKA, NUNITO} from '../components/fonts';
import {Brick} from '../components/Brick';
import {Bubble, Phone} from '../components/Phone';

// Scene 3 — Money shot (f480–900, lokal 0–420):
// "7 hari kemudian…" -> user bertanya -> brick alergi kacang terbang BALIK
// ke chat (DROP) -> bot menjawab dengan ingatan itu.
const ANSWER = 'Jangan kacang! Kamu alergi kacang — masih kuingat dari minggu lalu 😉';
const TRAY_X = [230, 540, 850];
const TRAY_Y = 1700;

const Pop: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 240}});
  const scale = interpolate(s, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at) return null;
  return <div style={{display: 'flex', flexDirection: 'column', transform: `scale(${scale})`, transformOrigin: 'center'}}>{children}</div>;
};

export const Money: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const capP = interpolate(frame, [20, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // screen shake saat DROP (lokal 143)
  const shakeT = frame >= 143 && frame < 158 ? (frame - 143) / 15 : -1;
  const shakeX = shakeT >= 0 ? Math.sin(shakeT * 40) * 14 * (1 - shakeT) : 0;
  const shakeY = shakeT >= 0 ? Math.cos(shakeT * 34) * 10 * (1 - shakeT) : 0;

  // brick recall: tray slot 0 -> chat (lokal 110–143)
  const flyT = interpolate(frame, [110, 143], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flyE = Easing.in(Easing.quad)(flyT);
  const flyX = TRAY_X[0] + (660 - TRAY_X[0]) * flyE;
  const flyY = TRAY_Y + (560 - TRAY_Y) * flyE - Math.sin(flyT * Math.PI) * 260;
  const ringP = frame >= 143 ? Math.min(1, (frame - 143) / 18) : 0;

  // chip recall setelah mendarat
  const chipS = spring({frame: frame - 160, fps, config: {damping: 10, stiffness: 200}});
  const chipScale = interpolate(chipS, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // bot mengetik jawaban (lokal 195–285)
  const typed = Math.floor(interpolate(frame, [195, 285], [0, ANSWER.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  // chip "ingat!" (lokal 350)
  const brainS = spring({frame: frame - 350, fps, config: {damping: 8, stiffness: 180}});
  const brainScale = interpolate(brainS, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      <div style={{transform: `translate(${shakeX}px, ${shakeY}px)`}}>
        {/* caption */}
        <div style={{position: 'absolute', top: 84, width: '100%', textAlign: 'center', opacity: capP}}>
          <span style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 46, color: INK_SOFT}}>
            📅 7 hari kemudian…
          </span>
        </div>

        {/* phone */}
        <div style={{position: 'absolute', left: 230, top: 190}}>
          <Phone>
            <Pop at={80}>
              <Bubble from="user">Makanan apa yang aman buatku?</Bubble>
            </Pop>
            {frame >= 160 && frame < 190 && (
              <Bubble from="bot">
                <span style={{color: INK_SOFT}}>•••</span>
              </Bubble>
            )}
            {frame >= 190 && (
              <Bubble from="bot">
                {ANSWER.slice(0, typed)}
                {typed < ANSWER.length && <span style={{color: INK_SOFT}}>▌</span>}
              </Bubble>
            )}
          </Phone>
        </div>

        {/* chip recall */}
        {frame >= 160 && (
          <div
            style={{
              position: 'absolute',
              left: 330,
              top: 770,
              transform: `scale(${chipScale}) rotate(-4deg)`,
              background: YELLOW,
              border: `5px solid ${INK}`,
              borderRadius: 16,
              padding: '10px 20px',
              fontFamily: NUNITO,
              fontWeight: 800,
              fontSize: 28,
              boxShadow: `5px 5px 0 ${INK}`,
            }}
          >
            🥜 alergi kacang · 7 hari lalu
          </div>
        )}

        {/* chip ingat! */}
        {frame >= 350 && (
          <div
            style={{
              position: 'absolute',
              left: 700,
              top: 1050,
              transform: `scale(${brainScale}) rotate(6deg)`,
              background: GREEN,
              color: '#fff',
              border: `5px solid ${INK}`,
              borderRadius: 999,
              padding: '12px 26px',
              fontFamily: FREDOKA,
              fontWeight: 700,
              fontSize: 34,
              boxShadow: `5px 5px 0 ${INK}`,
              zIndex: 5,
            }}
          >
            🧠 ingat!
          </div>
        )}

        {/* tray ingatan di bawah */}
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: CREAM2, borderTop: `6px solid ${INK}`}} />
        <div style={{position: 'absolute', top: 1560, width: '100%', textAlign: 'center'}}>
          <span style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 34, color: INK_SOFT}}>ingatan tersimpan</span>
        </div>
        {[
          {c: ORANGE, label: '🥜 alergi kacang', gone: frame >= 110},
          {c: BLUE, label: '☕ kopi tubruk', gone: false},
          {c: YELLOW, label: '🐱 Momo', gone: false},
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: TRAY_X[i] - 110,
              top: TRAY_Y - 60,
              opacity: b.gone ? interpolate(frame, [110, 125], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1,
              transform: b.gone ? `scale(${interpolate(frame, [110, 125], [1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})` : 'none',
            }}
          >
            <Brick color={b.c} width={220} height={80} label={b.label} fontSize={26} labelColor={b.c === BLUE ? '#fff' : INK} />
          </div>
        ))}

        {/* brick recall terbang */}
        {frame >= 104 && frame <= 143 && (
          <div
            style={{
              position: 'absolute',
              left: flyX - 140,
              top: flyY - 60,
              transform: `rotate(${interpolate(flyT, [0, 1], [10, -6])}deg)`,
              filter: 'drop-shadow(0 0 26px rgba(255,197,49,0.95))',
            }}
          >
            <Brick color={ORANGE} width={280} height={96} label="🥜 alergi kacang" fontSize={30} />
          </div>
        )}

        {/* ring impact saat DROP */}
        {frame >= 143 && ringP < 1 && (
          <div
            style={{
              position: 'absolute',
              left: 660 - ringP * 220,
              top: 560 - ringP * 220,
              width: ringP * 440,
              height: ringP * 440,
              borderRadius: '50%',
              border: `10px solid ${ORANGE}`,
              opacity: 1 - ringP,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
