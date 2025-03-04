import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function SceneProphecy() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <OrbitControls />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </Canvas>
  );
}
