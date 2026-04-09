import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { BillionairesChart } from "./BillionairesChart";
import { NaoEDom } from "./NaoEDom";
import { VIDEO } from "./NaoEDom/tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
