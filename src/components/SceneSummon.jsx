import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Physics, RigidBody, useRapier } from "@react-three/rapier";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import VoteSacrifice from "./VoteSacrifice";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import fontData from "three/examples/fonts/helvetiker_regular.typeface.json"; // Police par défaut

extend({ TextGeometry });

const MAX_BALLS = 20; // Limite pour améliorer les perfs

function CharacterWithMixamoAnimation() {
  // Charger le personnage GLB
  const { scene: character, animations: characterAnims } = useGLTF("/summon/models/viper-rig.glb");
  // Charger l'animation GLB
  const { scene: animScene, animations: anims } = useGLTF("/summon/models/animations/break-dance.glb");

  const mixerRef = useRef();

  useEffect(() => {
    if (!anims.length) return;

    const mixer = new THREE.AnimationMixer(character);
    mixerRef.current = mixer;

    // Prendre la première animation de Mixamo
    const action = mixer.clipAction(anims[0]);
    action.play();

    const animate = () => {
      requestAnimationFrame(animate);
      mixer.update(0.016); // Avance l'animation (16ms ≈ 60FPS)
    };

    animate();
  }, [anims, character]);

  return (

      <primitive object={character} position={[0, -1, 0]} />
      
  );
}

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

  function Goat({ ballCount }) {
    const { scene } = useGLTF("/summon/models/goat.glb");
    const goatRef = useRef();
    const lightRef = useRef();
    const targetRef = useRef();
    const progress = Math.min(ballCount / MAX_BALLS, 1);

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

        if (progress >= 1) {
          if (goatRef.current) { // ✅ Vérifie que goatRef.current existe
              goatRef.current.position.z = THREE.MathUtils.lerp(goatRef.current.position.z, -80, 0.002);
          }
      }
    });

    return (
      <>
      <directionalLight 
      ref={lightRef}
      intensity={100} 
      decay={3}
      distance={30}
      color="red" 
      castShadow
      position={[0, -50, -100]} // 🔥 Position de la lumière au-dessus de la chèvre
    />
    <mesh ref={targetRef} position={[0, 30, -100]} visible={true}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      <group ref={goatRef} position={[0, 0, -150]} rotation={[0, 0, 0]}>
        <primitive object={scene} scale={40} />
        
        {/* ✅ Lumière directionnelle pointant vers la chèvre */}
       
        
        {/* ✅ Target invisible pour la lumière */}
        
      </group>
      </>
    );
}


function EstusModel({ ballCount }) {
  const { scene } = useGLTF("/summon/models/estus1.glb");
  const flaskRef = useRef();
  const rigidBodyRef = useRef();
  const [flipped, setFlipped] = useState(false);

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

  useFrame(() => {
    if (ballCount === MAX_BALLS && flaskRef.current) {
      // ✅ Rotation progressive vers le bas
      flaskRef.current.rotation.x = THREE.MathUtils.lerp(flaskRef.current.rotation.x, Math.PI / 2, 0.05);

      // ✅ Une fois retournée, on la laisse fixe
      if (flaskRef.current.rotation.x > Math.PI / 3 && !flipped) {
        setFlipped(true);
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed" // ✅ Reste toujours fixe
      colliders="trimesh" // ✅ Collision plus précise
      margin={0.05}
    >
      {scene && (
        <primitive
          ref={flaskRef}
          object={scene}
          scale={5.1}
          position={[-0.5, -3.5, -0.8]}
          rotation={[0, Math.PI, 0]} // ✅ Début normal
        />
      )}
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
  const [sacrified, setSacrified] = useState(null);
  const [ballCount, setBallCount] = useState(0);

  const handleSacrifice = (pseudo) => {
    setSacrified(pseudo);
    // Ici tu déclenches ton animation 
  };

  return (
    <>
      {/* 🏆 Compteur de billes */}
      
      <VoteSacrifice onSacrifice={(pseudo) => handleSacrifice(pseudo)} />

      <Canvas
       style={{ background: "black" }}
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 200 }}
        
        >
       
          <fog attach="fog" args={['black', 0, 120]} />
        {/* 🌌 Bloom Effect pour l'ambiance */}
        {/* <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
        </EffectComposer> */}

        <Environment preset="night" />
        <RotatingLight ballCount={ballCount} />
        {/* <ambientLight intensity={1.5} /> */}
        <directionalLight decay={3} distance={15} intensity={10.5} color="red" position={[0, -5, 2]} />


        {sacrified && (
          <mesh position={[-0.5, -4.5, -1.5]}>
            <textGeometry args={[sacrified, { font: new FontLoader().parse(fontData), size: 0.5, height: 0.1 }]} />
            <meshStandardMaterial color="red" emissive="red" />
          </mesh>
        )}
        
        <Suspense fallback={null}>
            <Goat ballCount={ballCount}/>
            {/* <CharacterWithMixamoAnimation /> */}
          <group position={[0.3, 0.3, -1]} scale={0.7}>
            <Pentacle />
            <Marmitte />
            {/* <Physics gravity={[0, -9.81, 0]}>
              <EstusModel ballCount={ballCount}/>
              <BallSpawner setBallCount={setBallCount} />
              <RapierDebugRenderer />
            </Physics> */}
          </group>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}
