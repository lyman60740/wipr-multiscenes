import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Physics, RigidBody, useRapier } from "@react-three/rapier";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const MAX_BALLS = 200; // Limite pour améliorer les perfs

function RapierDebugRenderer() {
  const { world } = useRapier();
  useFrame(() => world.debugRender());
  return null;
}

function Pentacle() {
    const { scene } = useGLTF("/summon/models/pentacle1.glb");
    const pentacleRef = useRef();
  
    useFrame(() => {
      if (pentacleRef.current) {
        pentacleRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color("black"),
              
              emissiveIntensity: Math.min(2, 3),
              roughness: 0.5, // Surface lisse pour reflet
              metalness: 1, // Effet métallique
              clearcoat: 1, // Ajoute une couche de vernis
              clearcoatRoughness: 0, // Garde le vernis très brillant
            });
          }
        });
      }
    });
  
    return (
      <group ref={pentacleRef} position={[-0.5, -3.6, -1.2]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <primitive object={scene} scale={0.7} />
      </group>
    );
  }

  function Marmitte() {
    const { scene } = useGLTF("/summon/models/marmitte.glb");
    const marmitteRef = useRef();
  
    useFrame(() => {
      if (marmitteRef.current) {
        marmitteRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color("black"),
              
              emissiveIntensity: Math.min(2, 3),
              roughness: 0.5, // Surface lisse pour reflet
              metalness: 1, // Effet métallique
              clearcoat: 1, // Ajoute une couche de vernis
              clearcoatRoughness: 0, // Garde le vernis très brillant
            });
          }
        });
      }
    });
  
    return (
      <group ref={marmitteRef} position={[-0.5, -7, -1.5]} rotation={[0, 0, 0]}>
        <primitive object={scene} scale={6} />
      </group>
    );
  }

  function Goat() {
    const { scene } = useGLTF("/summon/models/goat.glb");
    const goatRef = useRef();
    const lightRef = useRef();
    const targetRef = useRef();

    useEffect(() => {
        if (scene) {
          scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true; // ✅ La Goat projette une ombre
              child.receiveShadow = true; // ✅ Elle peut recevoir des ombres
            }
          });
        }
      }, [scene]);

    // useFrame(() => {
    //   if (goatRef.current) {
    //     goatRef.current.traverse((child) => {
    //       if (child.isMesh) {
    //         child.material = new THREE.MeshPhysicalMaterial({
    //           color: new THREE.Color("black"),
    //           emissiveIntensity: Math.min(2, 3),
    //           roughness: 0.5, // Surface lisse pour reflet
    //           metalness: 1, // Effet métallique
    //           clearcoat: 1, // Ajoute une couche de vernis
    //           clearcoatRoughness: 0, // Garde le vernis très brillant
    //         });
    //       }
    //     });
    //   }
    // });

    // useEffect(() => {
    //     if (scene) {
    //         scene.traverse((child) => {
    //             if (child.isMesh) {
    //                 child.layers.set(1); // ⚡️ Place l'objet dans le layer 1
    //             }
    //         });
    //     }
    // }, [scene]);

    useFrame(() => {
        if (lightRef.current && targetRef.current) {
            lightRef.current.target.position.copy(targetRef.current.position);
            lightRef.current.target.updateMatrixWorld();
        }
    });

    return (
      <group ref={goatRef} position={[0, 0, -100]} rotation={[0, 0, 0]}>
        <primitive object={scene} scale={40} />
        
        {/* ✅ Lumière directionnelle pointant vers la chèvre */}
        <directionalLight 
          ref={lightRef}
          intensity={0} 
          decay={3}
          distance={30}
          color="white" 
          castShadow
          position={[0, -100, -100]} // 🔥 Position de la lumière au-dessus de la chèvre
        />
        
        {/* ✅ Target invisible pour la lumière */}
        <mesh ref={targetRef} position={[0, 0, -100]} visible={true}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    );
}


function EstusModel() {
  const { scene } = useGLTF("/summon/models/estus1.glb");

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: "#925ac9",
            transparent: true,
            opacity: 0.9,
            transmission: 0.95,
            sheen: 1,
            thickness: 0.9,
            roughness: 0.1,
            ior: 1.5,
            metalness: 0.5,
          });
        }
      });
    }
  }, [scene]);

  return (
    <RigidBody type="fixed" shape="cuboid" args={[1, 1, 1]} colliders="trimesh">
      {scene && <primitive object={scene} scale={5.1} position={[-0.5, -3.5, -0.8]} rotation={[0, Math.PI, 0]} />}
    </RigidBody>
  );
}

function Ball({ position, id, removeBall }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current && ref.current.translation().y < -6) {
      removeBall(id);
    }
  });

  return (
    <RigidBody ref={ref} colliders="ball" restitution={0.02} friction={0.9} gravityScale={1} linearDamping={0.2} angularDamping={0.3} mass={0.05}>
      <mesh position={position}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#c70c0c" emissive="#c70c0c" emissiveIntensity={0} />
      </mesh>
    </RigidBody>
  );
}

function BallSpawner({ setBallCount }) {
  const [balls, setBalls] = useState([]);

  useFrame(() => {
    if (balls.length < MAX_BALLS && Math.random() > 0.7) {
      const newBall = { id: Date.now(), position: [-0.5 + Math.random() * 0.01, -2, -0.8] };
      setBalls((b) => [...b, newBall]);
      setBallCount((prev) => prev + 1);
    }
  });

  const removeBall = (id) => setBalls((b) => b.filter((ball) => ball.id !== id));

  return balls.map((ball) => <Ball key={ball.id} position={ball.position} id={ball.id} removeBall={removeBall} />);
}


// 🔥 Lumières dynamiques et dézoom progressif
function RotatingLight({ ballCount }) {
    const lightRef1 = useRef();
    const lightRef2 = useRef();
    const { camera } = useThree();
    const targetZ = 8; // Dézoom final
  
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      const radius = 5;
      const progress = Math.min(ballCount / MAX_BALLS, 1); // Progression en %
  
      // ✅ Intensité qui augmente progressivement (de 0.1 à 10)
      const lightIntensity = 0.1 + progress * 9.9;
  
      if (lightRef1.current && lightRef2.current) {
        // ✅ Lumière principale (rotation normale)
        lightRef1.current.position.x = Math.sin(t * 0.5) * radius;
        lightRef1.current.position.z = Math.cos(t * 0.5) * radius;
        lightRef1.current.position.y = -2.5;
        lightRef1.current.intensity = lightIntensity;
  
        // ✅ Lumière opposée (rotation inversée)
        lightRef2.current.position.x = Math.sin(t * 0.5 + Math.PI) * radius;
        lightRef2.current.position.z = Math.cos(t * 0.5 + Math.PI) * radius;
        lightRef2.current.position.y = -2.5;
        lightRef2.current.intensity = lightIntensity;
      }
  
      // 🎥 Dézoom progressif quand 100% atteint
      if (progress >= 1) {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.02);
      }
    });
  
    return (
      <group>
        {/* ✅ Portée limitée et atténuation plus réaliste */}
        <spotLight 
          ref={lightRef1} 
          intensity={0.1} 
          castShadow 
          color="red" 
          position={[3, -2.5, 3]} 
          angle={Math.PI / 6} // ✅ Angle réduit pour un cône lumineux plus serré
          distance={5} // ✅ Empêche d’éclairer la Goat (loin en Z = -100)
          decay={3} // ✅ Atténuation progressive
        />
        
        <spotLight 
          ref={lightRef2} 
          intensity={0.1} 
          castShadow 
          color="red" 
          position={[-3, -2.5, -3]} 
          angle={Math.PI / 6} 
          distance={5} 
          decay={3} 
        />
      </group>
    );
  }
  
  
export default function SceneSummon() {
  const [ballCount, setBallCount] = useState(0);

  return (
    <>
      {/* 🏆 Compteur de billes */}
      <div style={{
        position: "absolute", top: 10, left: 10, color: "white", fontSize: "20px",
        background: "rgba(0, 0, 0, 0.5)", padding: "5px 10px", borderRadius: "5px", zIndex: 99
      }}>
        Billes : {ballCount} / {MAX_BALLS}
      </div>

      <Canvas
       style={{ background: "black" }}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 200 }}
        // fog={{ color: "#000000", near: 0, far: 1 }}
        >
        {/* 🌌 Bloom Effect pour l'ambiance */}
        {/* <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
        </EffectComposer> */}

        <Environment preset="night" />
        <RotatingLight ballCount={ballCount} />
        {/* <ambientLight intensity={1.5} /> */}
        <directionalLight decay={3} distance={15} intensity={10.5} color="red" position={[0, -5, 2]} />

        <Suspense fallback={null}>
            <Goat />
          <group position={[0.3, 0.3, -1]} scale={0.7}>
            <Pentacle />
            <Marmitte />
            <Physics gravity={[0, -9.81, 0]}>
              <EstusModel />
              <BallSpawner setBallCount={setBallCount} />
              <RapierDebugRenderer />
            </Physics>
          </group>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}
