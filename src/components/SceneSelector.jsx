
import "./SceneSelector.css";
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, SpotLight, ContactShadows, useTexture, MeshReflectorMaterial   } from '@react-three/drei';
import { EffectComposer, GodRays, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef, useEffect, useImperativeHandle, forwardRef, useMemo, useState, useLayoutEffect     } from 'react';
import { BackgroundGradient } from "./BackgroundGradient";
import gsap from "gsap";
import * as THREE from 'three';

const Model = forwardRef((props, ref) => {
  const { scene } = useGLTF('/main/wipr-logo.glb');
  const modelRef = useRef();


  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#253254"),
          metalness: 1,
          roughness: 0.2,
          clearcoat: 0.5,
          reflectivity: 0.8,
        });

        child.rotation.y = Math.PI
        child.position.y = 0.1
      }
    });
  }, []);
useImperativeHandle(ref, () => modelRef.current);
  return <primitive ref={modelRef} object={scene} scale={1.5} />;
});

const Sun = forwardRef((props, ref) => {
  const sunRef = useRef();

  // Expose le mesh via le ref pour l’utiliser dans GodRays
  useImperativeHandle(ref, () => sunRef.current, []);

  return (
    <mesh ref={sunRef} position={[0, 0, 12]}>
      <sphereGeometry args={[5, 16, 16]} />
      <meshBasicMaterial color="#253254" />
    </mesh>
  );
});

function SceneLighting({ sunRef, spotLightRef, directionalLightRef, color }) {
  const [sunMesh, setSunMesh] = useState(null);

  useEffect(() => {
    if (sunRef.current) {
      setSunMesh(sunRef.current);
    }

    if (spotLightRef.current) {
      spotLightRef.current.position.set(0, -10, 10);
    }

    if (sunRef.current) {
      sunRef.current.position.set(0, -10, 10);
    }
  }, []);

  // 👉 Animation douce du changement de couleur avec gsap
  useEffect(() => {
    if (spotLightRef.current && color) {
      const targetColor = new THREE.Color(color);
      gsap.to(spotLightRef.current.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [color]);

  useEffect(() => {
    if (directionalLightRef.current && color) {
      const targetColor = new THREE.Color(color);
      gsap.to(directionalLightRef.current.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [color]);

  return (
    <>
      <spotLight
        ref={spotLightRef}
        position={[0, 0, -2]}
        angle={1}
        penumbra={1}
        intensity={50}
        color={new THREE.Color("#253254")} // Couleur initiale
        castShadow
      />
<directionalLight
  ref={directionalLightRef}
  position={[0, 3, 6]}
  intensity={0}
  color={new THREE.Color("#253254")}
  castShadow
/>
      <Sun ref={sunRef} />

      <EffectComposer>
        {sunMesh && (
          <GodRays
            sun={sunMesh}
            samples={60}
            density={0.5}
            decay={0.98}
            weight={0.3}
            exposure={0.3}
            blur
          />
        )}
        <Bloom luminanceThreshold={0.7} intensity={0.4} />
      </EffectComposer>
    </>
  );
}




export default function SceneSelector({ onSelect }) {
  const audio = new Audio("/chant.mp3");
  audio.volume = 0.3;

  const handleClick = (scene) => {
    audio.play().catch(err => console.warn("Audio bloqué :", err));
    onSelect(scene);
  };

  const controlsRef = useRef();
const sunRef = useRef();
const spotLightRef = useRef();
const directionalLightRef = useRef();
const modelRef = useRef();
const [ready, setReady] = useState(false);
const [enableMouseRotation, setEnableMouseRotation] = useState(false);
const [spotColor, setSpotColor] = useState("#253254"); // couleur par défaut



useEffect(() => {
  if (!enableMouseRotation || !modelRef.current) return;

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;

    gsap.to(modelRef.current.rotation, {
      y: x * 0.4,
      x: y * 0.2,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [enableMouseRotation]);

useEffect(() => {
  let animationFrame;

  const waitForRefs = () => {
    const controls = controlsRef.current;
    const sun = sunRef.current;
    const light = spotLightRef.current;
    const model = modelRef.current;

   if (controls && sun && light && controls.object && model) {
  const camera = controls.object;

  // Départ caméra : centrée et proche du modèle
  camera.position.set(0, 0, -6);
  controls.target.set(0, 0, 0);
  controls.update();

const tl = gsap.timeline();

  // Soleil qui se lève en parallèle avec étape 2
tl.to(sun.position, {
  y: 0,
  duration: 2,
  ease: "power2.Out"
}); // "<" = démarrer en même temps

tl.to(light.position, {
  y: 0,
  duration: 2,
  ease: "power2.Out"
}, "<");


const dummy = { angle: Math.PI }; // derrière le modèle
const radius = 6;

tl.to(dummy, {
  angle: 0, // devant le modèle
  duration: 3,
  ease: "power3.inOut",
  onUpdate: () => {
    const x = Math.sin(dummy.angle) * radius;
    const z = Math.cos(dummy.angle) * radius;
    camera.position.set(x, 0, z);
    controls.target.set(0, 0, 0);
    controls.update();
  },
  onComplete: () => {
    // Corriger la toute petite imprécision
    camera.position.set(0, 0, radius);
    dummy.angle = 0;
    controls.update();
    sun.visible = false;
setEnableMouseRotation(true);
  }
});

    tl.to(directionalLightRef.current, {
      intensity: 10,
      duration: 1.5,
      ease: "power2.inOut",
    }, "<60%");


}
 else {
      animationFrame = requestAnimationFrame(waitForRefs); // Re-tente au frame suivant
    }
  };

  waitForRefs(); // Premier appel

  return () => cancelAnimationFrame(animationFrame); // Nettoyage au démontage
}, []);





  return (
    <>
    <div className="home">
      <div className="home__selector">
    <div
        // onClick={() => handleClick("curse")}
        onMouseEnter={() => setSpotColor("green")}
        onMouseLeave={() => setSpotColor("#253254")}
        className="disabled_event"
      >
    <span>Curse</span>
    <span>soon</span>
  </div>
  <div
    onClick={() => handleClick("summon")}
    onMouseEnter={() => setSpotColor("red")}
    onMouseLeave={() => setSpotColor("#253254")}
  >
    <span>Sacrifice</span>
    
  </div>
  <div
    // onClick={() => handleClick("prophecy")}
    onMouseEnter={() => setSpotColor("white")}
    onMouseLeave={() => setSpotColor("#253254")}
    className="disabled_event"
  >
    <span>Prophecy</span>
    <span>soon</span>
  </div>
      </div>
  
</div>

     <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      shadows
      gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['black']} />
      <fog attach="fog" args={['black', 2, 8]} />
      <ambientLight intensity={10.5} />

      <Suspense fallback={null}>
         <mesh
  position={[0, -0.9, 0]}
  rotation={[-Math.PI / 2, 0, 0]}
  receiveShadow
>
  <planeGeometry args={[5, 50]} />
  <MeshReflectorMaterial
    blur={[300, 100]} // flou horizontal / vertical
    resolution={1024}
    mixBlur={1}
    mixStrength={40}
    roughness={0.3}
    metalness={0.8}
    color="#111"
    mirror={1}
    depthScale={1}
    minDepthThreshold={0.8}
    maxDepthThreshold={1}
  />
</mesh>
        <Model ref={modelRef} />
      </Suspense>


      <SceneLighting sunRef={sunRef} spotLightRef={spotLightRef} directionalLightRef={directionalLightRef} color={spotColor}/>

      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} />
    </Canvas>
    </>
  );
}

