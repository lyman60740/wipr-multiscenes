import { useMemo } from "react";
import * as THREE from "three";

export function BackgroundGradient() {
  const shader = useMemo(() => ({
    uniforms: {
      uTopColor: { value: new THREE.Color("#253254") },
      uBottomColor: { value: new THREE.Color("#000000") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;

      void main() {
        vec3 color = mix(uBottomColor, uTopColor, vUv.y);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false,
    depthWrite: false,
  }), []);

  return (
    <mesh position={[0, 0, -10]} scale={[50, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[shader]} />
    </mesh>
  );
}
