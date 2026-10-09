import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {SCENES} from '../timeline';
import {Sting} from './Sting';
import {Facts} from './Facts';
import {Money} from './Money';
import {Memories} from './Memories';
import {Cta} from './Cta';

const SCENE_MAP: Record<string, React.FC> = {
  sting: Sting,
  facts: Facts,
  money: Money,
  memories: Memories,
  cta: Cta,
};

export const Film: React.FC = () => (
  <AbsoluteFill>
    {SCENES.map((s) => {
      const C = SCENE_MAP[s.id];
      return (
        <Sequence key={s.id} from={s.start} durationInFrames={s.duration} name={s.id}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile('score.wav')} volume={0.9} />
  </AbsoluteFill>
);
