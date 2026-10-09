import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {CREAM, CREAM2, INK, INK_SOFT, BLUE, GREEN} from './theme';
import {FREDOKA, NUNITO} from './fonts';

export const Bubble: React.FC<{
  from: 'user' | 'bot';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({from, children, style}) => {
  const isUser = from === 'user';
  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        background: isUser ? BLUE : CREAM2,
        color: isUser ? '#fff' : INK,
        border: `5px solid ${INK}`,
        borderRadius: 26,
        borderBottomRightRadius: isUser ? 8 : 26,
        borderBottomLeftRadius: isUser ? 26 : 8,
        padding: '18px 24px',
        fontFamily: NUNITO,
        fontWeight: 700,
        fontSize: 30,
        lineHeight: 1.4,
        boxShadow: `5px 5px 0 ${INK}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Phone: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      width: 620,
      height: 1180,
      background: CREAM,
      border: `10px solid ${INK}`,
      borderRadius: 72,
      boxShadow: `16px 16px 0 ${INK}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '26px 30px',
        background: CREAM2,
        borderBottom: `6px solid ${INK}`,
      }}
    >
      <Img
        src={staticFile('eling-avatar.webp')}
        style={{
          width: 84,
          height: 84,
          borderRadius: 26,
          border: `5px solid ${INK}`,
        }}
      />
      <div>
        <div style={{fontFamily: FREDOKA, fontWeight: 700, fontSize: 38, lineHeight: 1}}>
          Eling
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 8,
            fontFamily: NUNITO,
            fontWeight: 700,
            fontSize: 22,
            color: INK_SOFT,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: GREEN,
              display: 'inline-block',
            }}
          />
          online
        </div>
      </div>
    </div>
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        padding: '30px 28px',
      }}
    >
      {children}
    </div>
  </div>
);

export const CenterStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      background: CREAM,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
  >
    {children}
  </AbsoluteFill>
);
