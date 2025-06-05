import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls,FirstPersonControls, useGLTF,useTexture, Environment, useAnimations, Text3D, Center, SpotLight  } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Physics, RigidBody, useRapier } from "@react-three/rapier";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {VoteMessages3D} from "./VoteSacrifice";
import {PictureFrame} from "./PictureFrame";
import { FlameEffect } from "./FlameEffect.jsx";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import fontData from "three/examples/fonts/helvetiker_regular.typeface.json"; // Police par défaut



extend({ TextGeometry });

const MAX_BALLS = 20; // Limite pour améliorer les perfs
const font = new FontLoader().parse(fontData);



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

 function HellArena() {
    const { scene } = useGLTF("/summon/models/hell_arena1.glb")
    const hellArenaRef = useRef()
  
    useEffect(() => {
      if (!hellArenaRef.current) return
  
      hellArenaRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }

      })
    })
  
    return (
      <group
        ref={hellArenaRef}
        position={[-0.5, -10, -1.5]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <primitive object={scene} scale={7.0} />
      </group>
    )
  }


function Pentacle() {
  const pentacleRef = useRef();
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();

    pentacleRef.current.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: "black",
          emissiveIntensity: 2,
          roughness: 0.5,
          clearcoat: 2,
          metalness: 1,
          emissive: new THREE.Color("black"),
        });
      }
    });
  }, []);

  useFrame(() => {
    if (pentacleRef.current && startTime.current !== null) {
      const elapsed = (Date.now() - startTime.current) / 1000; // en secondes
      let rotationSpeed;
      const chrono = 40

      if (elapsed <= chrono) {
        // Accélération exponentielle durant les 10 premières secondes
        rotationSpeed = THREE.MathUtils.lerp(0.2, 12, Math.pow(elapsed / chrono, 3));
      } else if (elapsed > chrono && elapsed <= 12) {
        // Décélération progressive sur les 2 secondes suivantes
        const decelProgress = (elapsed - chrono) / 2; // 0 à 1
        rotationSpeed = THREE.MathUtils.lerp(12, 0, decelProgress * decelProgress);
      } else {
        rotationSpeed = 0; // Arrêt complet après 12 secondes
      }

      pentacleRef.current.rotation.z += rotationSpeed * 0.016; // basé sur ~60fps
    }
  });

  const { scene } = useGLTF("/summon/models/pentacle.glb");

  return (
    <group ref={pentacleRef} position={[-0.5, -3.6, -1.2]} rotation={[0, 0, 0]}>
      <primitive object={scene} scale={0.7} />
    </group>
  );
}


  function Marmitte() {
    const { scene } = useGLTF("/summon/models/autel.glb")
    const marmitteRef = useRef()
  
    // Charger vos 4 textures
    const [diffMap, dispMap, normalMap, roughMap] = useTexture([
      "/summon/textures/cracked_concrete_wall_diff_2k.jpg",
      "/summon/textures/cracked_concrete_wall_disp_2k.png",
      "/summon/textures/cracked_concrete_wall_nor_gl_2k.jpg",   // <-- peut poser problème si .exr n'est pas supporté
      "/summon/textures/cracked_concrete_wall_rough_2k.jpg"      // idem
    ])
  
    useEffect(() => {
      if (!marmitteRef.current) return
  
      marmitteRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
  
          // Appliquer un matériau PBR standard
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('black'),
            map: diffMap,             // Couleur de base
            normalMap: normalMap,     // Relief
            roughnessMap: roughMap,   // Rugosité
            displacementMap: dispMap, // Displacement
            displacementScale: 0.1,   // Ajustez pour plus ou moins de relief
          })
        }
      })
    }, [diffMap, dispMap, normalMap, roughMap])
  
    return (
      <group
        ref={marmitteRef}
        position={[-0.5, -7, -1.5]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={scene} scale={0.04} />
      </group>
    )
  }

  function Goat({ ballCount, advanceGoat }) {
    const { scene } = useGLTF("/summon/models/goat.glb");
    const goatRef = useRef();
    const lightRef = useRef();
    const targetRef = useRef();
    const progress = Math.min(ballCount / MAX_BALLS, 1);
  
    useEffect(() => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [scene]);

    // useFrame(() => {
    //   if (goatRef.current) {
    //     goatRef.current.traverse((child) => {
    //       if (child.isMesh) {
    //         child.material = new THREE.MeshPhysicalMaterial({
    //           color: new THREE.Color("gray"),
              
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
  
    useFrame(() => {
      if (lightRef.current && goatRef.current) {
        // Mettre à jour la cible du spotlight pour qu'elle suive la position de la goat
        lightRef.current.target.position.copy(goatRef.current.position);
        lightRef.current.target.updateMatrixWorld();
      }
      // Déplacement de la goat lors du sacrifice
      if (advanceGoat && goatRef.current) {
        goatRef.current.position.z = THREE.MathUtils.lerp(goatRef.current.position.z, -70, 0.02);
      }
    });
  
    return (
      <>
       <spotLight
        ref={lightRef}
        intensity={500}
        color="red"
        castShadow
        position={[0, -0, -30]}
        angle={Math.PI / 6}   // Angle du cône du spotlight
        penumbra={0.2}         // Adoucit les bords du cône
        distance={1500}
      />
        <mesh ref={targetRef} position={[0, 30, -100]} visible={true}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <group ref={goatRef} position={[0, 20, -150]} rotation={[Math.PI * 0.1, 0, 0]}>
          <primitive object={scene} scale={40} />
        </group>
      </>
    );
  }
  
function CameraLerp({ setCameraTraveling, audioRef, setStartVotes, startCameraLerp }) {
  const { camera } = useThree();
  const targetPos = new THREE.Vector3(0, -1, 5);
  const startPos = new THREE.Vector3(5, 150, 150);

  useFrame(() => {
   if (!startCameraLerp) return;

    camera.position.lerp(targetPos, 0.005);
    if (camera.position.distanceTo(targetPos) < 0.1) {
      camera.position.copy(targetPos);
      camera.userData.traveling = false;
      setCameraTraveling(false);
      if (audioRef.current?.paused) {
  audioRef.current.play().catch(err => console.warn("Audio bloqué :", err));
}
      setStartVotes(true); // 🚀 autorise le chrono
    }
  });

  useEffect(() => {
  camera.position.copy(startPos);
}, []);


  return null;
}



  
  export default function SceneSummon() {
    const audioRef = useRef();
    const [sacrified, setSacrified] = useState(null);
const [advanceGoat, setAdvanceGoat] = useState(false);
const [timeLeft, setTimeLeft] = useState(10);
const [showIntroText, setShowIntroText] = useState(true); // 👈 ICI
const [cameraTraveling, setCameraTraveling] = useState(true);
const [startCameraLerp, setStartCameraLerp] = useState(false);
const [showScene, setShowScene] = useState(false);
const [startVotes, setStartVotes] = useState(false);
const [isSceneReady, setIsSceneReady] = useState(false); // 👈 pour charger sans afficher
const [sceneOpacity, setSceneOpacity] = useState(0);
const [voteEnded, setVoteEnded] = useState(false);

useEffect(() => {
  if (startVotes) {
    const timer = setTimeout(() => {
      setVoteEnded(true);
    }, 40000); // vote dure 40s ?
    return () => clearTimeout(timer);
  }
}, [startVotes]);

useEffect(() => {
  // Création et démarrage audio dès apparition du message
  audioRef.current = new Audio("/assets/chant.mp3");
  audioRef.current.volume = 0.5;

  audioRef.current.play().catch((e) => {
    console.warn("Lecture audio bloquée jusqu'à interaction utilisateur :", e);
  });

  // Charge la scène mais ne l'affiche qu'après 6s
  setIsSceneReady(true); // démarre le rendu Three.js
  setTimeout(() => {
  setStartCameraLerp(true); // <--- Ajout ici
  const el = document.getElementById("intro-text");
  if (el) el.style.opacity = 0;

  setTimeout(() => {
    setShowIntroText(false);
    setShowScene(true);
    setTimeout(() => {
      setSceneOpacity(1);
    }, 50);
  }, 1000);
}, 6000);

}, []);

const resetScene = () => {
  setSacrified(null);
  setAdvanceGoat(false);
  setTimeLeft(10);
  setShowIntroText(true);
  setCameraTraveling(true);
  setStartCameraLerp(false);
  setShowScene(false);
  setStartVotes(false);
  setIsSceneReady(false);
  setSceneOpacity(0);
  setVoteEnded(false);

  // Relancer l’intro
  setTimeout(() => {
    audioRef.current = new Audio("/assets/chant.mp3");
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch((e) =>
      console.warn("Lecture audio bloquée :", e)
    );
    setIsSceneReady(true);
    setStartCameraLerp(true);

    setTimeout(() => {
      const el = document.getElementById("intro-text");
      if (el) el.style.opacity = 0;

      setTimeout(() => {
        setShowIntroText(false);
        setShowScene(true);
        setTimeout(() => setSceneOpacity(1), 50);
      }, 1000);
    }, 6000);
  }, 100); // petit délai pour "remonter" proprement
};


    const handleSacrifice = (pseudo) => {
      setSacrified(pseudo);
      setAdvanceGoat(true); // déclenche le déplacement de la goat
    };
  
    return (
      <>
      {showIntroText && (
  <div style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "2rem",
    fontFamily: "serif",
    textAlign: "center",
    opacity: cameraTraveling ? 1 : 0,
    transition: "opacity 1s ease-in-out",
    pointerEvents: "none",
    zIndex: 1000
  }}>
    Pour prêter son pouvoir à Zerance, El Diablo demande un sacrifice... <br/> Votez pour le wipsiti qui se fera ban en écrivant : "!sacrifie pseudo"
  </div>
)}
{isSceneReady && (
  <>
  <button
    onClick={resetScene}
    style={{
      position: "absolute",
      bottom: "1rem",
      left: "20px",

      padding: "1rem 2rem",
      fontSize: "20px",
      backgroundColor: "white",
      color: "black",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      zIndex: 1000,
      opacity: showScene ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}
  >
    🔁 Relancer le vote
  </button>
<div style={{
    position: "absolute",
    bottom: "20px",
    right: "20px",
    color: "white",
    fontSize: "20px",
    fontFamily: "serif",
    opacity: showScene ? 1 : 0,
    transition: "opacity 1s ease-in-out",
    pointerEvents: "none",
    zIndex: 1000
  }}>
    Commande de vote : "!sacrifie pseudo"<br/>
  </div>
  </>
)}
{isSceneReady && (
  
  <div
  style={{
    opacity: showScene ? sceneOpacity : 0,
    transition: "opacity 1.5s ease-in-out",
    pointerEvents: showScene ? "auto" : "none"
  }}
>
    <Canvas
          style={{ background: "black" }}
          gl={{ physicallyCorrectLights: true }}
          camera={{ position: [0, -1, 5], fov: 65, near: 0.1, far: 200 }}
        >



          <fog attach="fog" args={['black', 0, 120]} />
          <Environment preset="night" />
          {/* <ambientLight intensity={0.5}/> */}
         

<EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.6} radius={0.2} />
      </EffectComposer>
         
          {/* <spotLight
            decay={1}
            distance={15}
            intensity={10}
            color="white"
            position={[0, -3, 5]}
          /> */}
          <Suspense fallback={null}>
            <CameraLerp
  setCameraTraveling={setCameraTraveling}
  audioRef={audioRef}
  setStartVotes={setStartVotes}
  startCameraLerp={startCameraLerp}
/>
            {/* Passage de la prop advanceGoat à Goat */}
            <HellArena />
            <Goat  advanceGoat={advanceGoat} />
            <group position={[0.3, 2, -1]} scale={0.7}>
            <Pentacle />
            {/* <FlameEffect position={[0, 0, 0]} scale={3} zoom={20.5} transparent depthWrite={false}/> */}
              <Marmitte />
              <PictureFrame 
                image="/summon/wipr-filou1.png" 
                position={[-4, -4.9, -2]} 
                planeArgs={[1.55, 2.2]} 
                planePosition={[-0.5, 0.6, 0.03]} 
                groupRotation={[0, Math.PI * 0.25, 0]}
                scale={1}
                frameRotation={[0, -Math.PI / 2, 0]}
              />

            <PictureFrame 
                image="/summon/wipette.png" 
                position={[4, -4.9, -1.2]} 
                planeArgs={[1.55, 2.2]} 
                planePosition={[-0.5, 0.6, 0.03]} 
                groupRotation={[0, -Math.PI * 0.25, 0]}
                scale={1}
                frameRotation={[0, -Math.PI / 2, 0]}
                castShadow
              />
            </group>
          </Suspense>
            <VoteMessages3D onSacrifice={handleSacrifice} startVotes={startVotes} />
          <OrbitControls />
          {/* <FirstPersonControls movementSpeed={1} lookSpeed={0.1} /> */}
        </Canvas>
  </div>
)}

       
      </>
    );
  }
  
