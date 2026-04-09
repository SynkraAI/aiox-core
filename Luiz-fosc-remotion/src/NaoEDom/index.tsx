import { AbsoluteFill } from 'remotion';
import { Hook } from './sections/Hook';
import { Agitation } from './sections/Agitation';
import { Before } from './sections/Before';
import { After } from './sections/After';
import { Bridge } from './sections/Bridge';
import { Cta } from './sections/Cta';
import { Signature } from './sections/Signature';
import { COLORS } from './tokens';

export const NaoEDom: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.BG }}>
      <Hook />
      <Agitation />
      <Before />
      <After />
      <Bridge />
      <Cta />
      <Signature />
    </AbsoluteFill>
  );
};
