import {registerRoot, Composition} from 'remotion';
import {Film} from './scenes/Film';
import {FPS, TOTAL_FRAMES, WIDTH, HEIGHT} from './timeline';

export const RemotionRoot = () => (
  <Composition
    id="Film"
    component={Film}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={TOTAL_FRAMES}
    defaultProps={{}}
  />
);

registerRoot(RemotionRoot);
