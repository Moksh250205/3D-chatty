import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Avatar } from "./Avatar";

export const Experience = () => {
  const texture = useTexture("/Background.jpg");

  return (
    <>
      <Avatar />
      <Environment preset="sunset" />
      <OrbitControls />
    </>
  );
};