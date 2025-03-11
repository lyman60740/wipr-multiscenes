import { useRef, useMemo, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function PictureFrame({
  image,
  position = [0, 0, 0],
  planeArgs = [1, 1],
  planePosition = [0, 0, 0.1],
  planeRotation = [0, 0, 0],
  scale = 1,
  frameRotation = [0, -Math.PI / 2, 0],
  groupRotation = [0, 0, 0]
}) {
  const { scene } = useGLTF("/summon/models/picture_frame.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const texture = useTexture(image);
  const groupRef = useRef();

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: "#aaa",
          metalness: 0.9,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          reflectivity: 0.9,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={groupRotation}>
      <primitive object={clonedScene} scale={0.005} rotation={frameRotation} />
      <mesh position={planePosition} rotation={planeRotation} scale={0.5}>
        <planeGeometry args={planeArgs} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}
