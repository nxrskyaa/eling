import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, ORANGE, BLUE, YELLOW} from '../components/theme';
import {FREDOKA, NUNITO} from '../components/fonts';
import {Brick} from '../components/Brick';

// Scene 5 — CTA (f1140–1350, lokal 0–210): hening 1 beat sebelumnya (di score),
// lalu sting: avatar + tombol-brick CTA + handle + badge hackathon. Hold >=3s.
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 540;

  const avatarS = spring({frame: frame - 5, fps, config: {damping: 9, stiffness: 150}});
  const avatarScale = interpolate(avatarS, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const floatY = Math.sin(frame * 0.06) * 10;

  const btnS = spring({frame: frame - 25, fps, config: {damping: 10, stiffness: 200}});
  const btnScale = interpolate(btnS, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const handleP = interpolate(frame, [48, 62], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const plateP = interpolate(frame, [70, 86], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const plateY = interpolate(plateP, [0, 1], [60, 0]);

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      {/* avatar */}
      {frame >= 5 && (
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: 300 + floatY,
            width: 260,
            height: 260,
            marginLeft: -130,
            borderRadius: 40,
            border: `8px solid ${INK}`,
            boxShadow: `10px 10px 0 ${INK}`,
            overflow: 'hidden',
            background: INK,
            transform: `scale(${avatarScale})`,
          }}
        >
          <Img src={staticFile('eling-avatar.webp')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      )}

      {/* tombol-brick CTA */}
      {frame >= 25 && (
        <div style={{position: 'absolute', left: cx - 380, top: 660, transform: `scale(${btnScale})`}}>
          <Brick color={ORANGE} width={760} height={140} studs={6} label="💬 Chat di Telegram" labelColor="#fff" fontSize={52} />
        </div>
      )}

      {/* handle */}
      <div style={{position: 'absolute', top: 920, width: '100%', textAlign: 'center', opacity: handleP}}>
        <span style={{fontFamily: FREDOKA, fontWeight: 700, fontSize: 64, color: INK, background: YELLOW, padding: '8px 30px', borderRadius: 18, border: `6px solid ${INK}`}}>
          @ElingWalz_bot
        </span>
      </div>

      {/* badge hackathon */}
      <div
        style={{
          position: 'absolute',
          top: 1100 + plateY,
          left: cx - 400,
          width: 800,
          opacity: plateP,
          background: INK,
          borderRadius: 24,
          padding: '30px 36px',
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: NUNITO, fontWeight: 800, fontSize: 30, color: '#B9B2A4', letterSpacing: 3}}>
          WALRUS SESSION 8
        </div>
        <div style={{fontFamily: FREDOKA, fontWeight: 600, fontSize: 40, color: CREAM, marginTop: 10}}>
          Chatbots That Remember
        </div>
      </div>

      {/* brick fakta melayang — mengisi ruang, reinforce tema ingatan */}
      {[ORANGE, BLUE, YELLOW].map((c, i) => {
        const fy = 1450 + Math.sin(frame * 0.05 + i * 2.1) * 14;
        const fp = interpolate(frame, [86 + i * 10, 100 + i * 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: 150 + i * 260, top: fy, opacity: fp}}>
            <Brick color={c} width={220} height={84} studs={3} />
          </div>
        );
      })}

      {/* baseplate bawah */}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, background: CREAM2, borderTop: `6px solid ${INK}`}}>
        <div style={{position: 'absolute', top: -26, left: 60, right: 60, display: 'flex', justifyContent: 'space-between'}}>
          {Array.from({length: 9}).map((_, i) => (
            <div key={i} style={{width: 40, height: 40, borderRadius: '50%', background: CREAM2, border: `6px solid ${INK}`, marginTop: 6}} />
          ))}
        </div>
        <div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center'}}>
          <span style={{fontFamily: NUNITO, fontWeight: 700, fontSize: 28, color: INK_SOFT}}>
            Eling 🧱 — bot yang tidak pernah lupa
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
