import React from 'react';
import {AbsoluteFill, Img, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, ORANGE} from '../components/theme';
import {FREDOKA, NUNITO} from '../components/fonts';
import {Brick} from '../components/Brick';

// Scene 1 — Logo sting (f0–120): brick jatuh "gedebuk", avatar pop, judul slam.
export const Sting: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = 540;

  // Brick jatuh: f0 -> mendarat f28 (cue thud)
  const landF = 28;
  const restY = 1050;
  const fallY = interpolate(frame, [0, landF], [-500, restY], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bounce = frame > landF ? Math.abs(Math.sin((frame - landF) * 0.32)) * 64 * Math.exp(-(frame - landF) / 10) : 0;
  const squashT = Math.max(0, 1 - (frame - landF) / 10);
  const scaleY = frame >= landF ? 1 - 0.28 * squashT : 1;
  const scaleX = frame >= landF ? 1 + 0.22 * squashT : 1;

  // Debu saat mendarat
  const dustP = frame >= landF ? Math.min(1, (frame - landF) / 22) : 0;
  const dustR = interpolate(dustP, [0, 1], [10, 130]);
  const dustO = interpolate(dustP, [0, 1], [0.55, 0]);

  // Avatar pop f38
  const avatarS = spring({frame: frame - 38, fps, config: {damping: 9, stiffness: 150}});
  const avatarScale = interpolate(avatarS, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const avatarY = interpolate(avatarS, [0, 1], [160, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Judul slam f58
  const titleS = spring({frame: frame - 58, fps, config: {damping: 11, stiffness: 220}});
  const titleScale = interpolate(titleS, [0, 1], [1.5, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleO = frame >= 58 ? 1 : 0;

  // Sub f80
  const subP = interpolate(frame, [80, 95], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const subY = interpolate(subP, [0, 1], [46, 0]);

  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden'}}>
      {/* bayangan brick */}
      <div
        style={{
          position: 'absolute',
          left: cx - 190,
          top: restY + 62,
          width: 380,
          height: 44,
          borderRadius: '50%',
          background: INK,
          opacity: interpolate(frame, [0, landF], [0, 0.14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transform: `scaleX(${interpolate(fallY, [-500, restY], [0.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
        }}
      />
      {/* brick jatuh */}
      <div
        style={{
          position: 'absolute',
          left: cx - 210,
          top: fallY - bounce - 60,
          transform: `scale(${scaleX}, ${scaleY})`,
        }}
      >
        <Brick color={ORANGE} width={420} height={120} studs={4} shadow={false} />
      </div>
      {/* debu */}
      {frame >= landF && dustP < 1 && (
        <>
          {[-260, 260].map((dx) => (
            <div
              key={dx}
              style={{
                position: 'absolute',
                left: cx + dx - dustR,
                top: restY + 40 - dustR,
                width: dustR * 2,
                height: dustR * 2,
                borderRadius: '50%',
                background: CREAM,
                border: `8px solid ${INK}`,
                opacity: dustO,
              }}
            />
          ))}
        </>
      )}
      {/* avatar pop — dalam bingkai brick ala landing page */}
      {frame >= 38 && (
        <div
          style={{
            position: 'absolute',
            left: cx - 165,
            top: 400 + avatarY,
            width: 330,
            height: 330,
            borderRadius: 44,
            border: `8px solid ${INK}`,
            boxShadow: `12px 12px 0 ${INK}`,
            overflow: 'hidden',
            background: INK,
            transform: `scale(${avatarScale})`,
          }}
        >
          <Img
            src={staticFile('eling-avatar.webp')}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </div>
      )}
      {/* judul */}
      <div
        style={{
          position: 'absolute',
          top: 1240,
          width: '100%',
          textAlign: 'center',
          opacity: titleO,
          transform: `scale(${titleScale})`,
        }}
      >
        <span style={{fontFamily: FREDOKA, fontWeight: 700, fontSize: 168, color: INK, letterSpacing: 6}}>
          ELING
        </span>
      </div>
      {/* sub */}
      <div
        style={{
          position: 'absolute',
          top: 1470,
          width: '100%',
          textAlign: 'center',
          opacity: subP,
          transform: `translateY(${subY}px)`,
        }}
      >
        <span style={{fontFamily: NUNITO, fontWeight: 700, fontSize: 44, color: INK_SOFT}}>
          Bot yang tidak pernah lupa
        </span>
      </div>
      {/* baseplate: strip bawah agar komposisi tidak mengambang */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 130,
          background: CREAM2,
          borderTop: `6px solid ${INK}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 60,
            right: 60,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {Array.from({length: 9}).map((_, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: CREAM2,
                border: `6px solid ${INK}`,
                marginTop: 8,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
