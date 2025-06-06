import { useEffect, useState } from "react";
import { useSceneStore } from "./store";
import SceneCurse from "./components/SceneCurse";
import SceneSummon from "./components/SceneSummon";
import SceneProphecy from "./components/SceneProphecy";
import UIOverlay from "./components/UIOverlay";
import SceneSelector from "./components/SceneSelector";
import FadeTransition from "./components/FadeTransition";
import "./index.css";

export default function App() {
  const { currentScene, setScene, setShowUI, showUI } = useSceneStore();
  const [sceneSelected, setSceneSelected] = useState(false);

  const handleSceneSelect = (scene) => {
    const audio = new Audio("/chant.mp3");
    audio.volume = 0.5;
    window.__audio = audio;
    setScene(scene);
    setSceneSelected(true);
  };
  const onBack = () => {
  setSceneSelected(false);
  setScene(null);       // ou setScene("") si c’est un string vide par défaut
  setShowUI(false);     // optionnel si tu veux masquer l’UI
};


  // rendu
  return (
    <>
      <FadeTransition visible={!sceneSelected}>
        <SceneSelector onSelect={handleSceneSelect} />
      </FadeTransition>

      <FadeTransition visible={sceneSelected && currentScene === "curse"}>
        <SceneCurse />
      </FadeTransition>

      <FadeTransition visible={sceneSelected && currentScene === "summon"}>
        <SceneSummon onBack={onBack}/>
      </FadeTransition>

      <FadeTransition visible={sceneSelected && currentScene === "prophecy"}>
        <SceneProphecy />
      </FadeTransition>

      {sceneSelected && showUI && <UIOverlay />}
    </>
  );
}
