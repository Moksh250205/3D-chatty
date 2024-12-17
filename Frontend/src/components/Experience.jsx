import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";
import { useThree } from "@react-three/fiber";

export const Experience = () => {
  const texture = useTexture("/Background.jpg");
  const { viewport } = useThree((state) => state); 

  const aspectRatio = viewport.width / viewport.height;

  return (
    <>
      <Avatar />

      <Environment preset="sunset" />
      {/* <OrbitControls /> */}
    </>
  );
};
