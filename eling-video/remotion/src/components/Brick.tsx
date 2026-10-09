import React from 'react';
import {INK} from './theme';
import {FREDOKA} from './fonts';

// Brick Lego chunky: studs di atas, border tinta tebal, hard shadow.
export const Brick: React.FC<{
  color: string;
  width: number;
  height?: number;
  studs?: number;
  label?: string;
  labelColor?: string;
  fontSize?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({
  color,
  width,
  height = 88,
  studs,
  label,
  labelColor = INK,
  fontSize = 34,
  shadow = true,
  style,
}) => {
  const n = studs ?? Math.max(2, Math.round(width / 110));
  const studD = Math.min(40, Math.max(26, width / (n * 2.6)));
  return (
    <div style={{position: 'relative', width, ...style}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          padding: `0 ${studD * 0.9}px`,
        }}
      >
        {Array.from({length: n}).map((_, i) => (
          <div
            key={i}
            style={{
              width: studD,
              height: studD,
              borderRadius: '50%',
              background: color,
              border: `6px solid ${INK}`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: -studD / 2,
          background: color,
          border: `6px solid ${INK}`,
          borderRadius: 18,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          boxShadow: shadow ? `8px 8px 0 ${INK}` : 'none',
        }}
      >
        {label ? (
          <span
            style={{
              fontFamily: FREDOKA,
              fontWeight: 600,
              fontSize,
              color: labelColor,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
};
