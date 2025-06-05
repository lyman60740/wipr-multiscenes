import { useEffect, useState } from "react";
import { useSceneStore } from "./store";
import SceneCurse from "./components/SceneCurse";
import SceneSummon from "./components/SceneSummon";
import SceneProphecy from "./components/SceneProphecy";
import UIOverlay from "./components/UIOverlay";
import SceneSelector from "./components/SceneSelector";

export default function App() {
  const { currentScene, setScene, setShowUI, showUI } = useSceneStore();
  const [sceneSelected, setSceneSelected] = useState(false);

 const handleSceneSelect = (scene) => {
  const audio = new Audio("/chant.mp3");
  audio.volume = 0.5;
  window.__audio = audio; // 🔊 on stocke l'audio globalement

  setScene(scene);
  setSceneSelected(true);
};

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        setShowUI(true);
      }
    };
    const handleKeyUp = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        setShowUI(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setShowUI]);

  return (
    <>
      {!sceneSelected && <SceneSelector onSelect={handleSceneSelect} />}
      {sceneSelected && currentScene === "curse" && <SceneCurse />}
      {sceneSelected && currentScene === "summon" && <SceneSummon />}
      {sceneSelected && currentScene === "prophecy" && <SceneProphecy />}
      {sceneSelected && showUI && <UIOverlay />}
    </>
  );
}
