import { useEffect } from "react";
import { useSceneStore } from "./store";
import SceneCurse from "./components/SceneCurse";
import SceneSummon from "./components/SceneSummon";
import SceneProphecy from "./components/SceneProphecy";
import UIOverlay from "./components/UIOverlay";

export default function App() {
  const { currentScene, setScene, setShowUI, showUI } = useSceneStore();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "1") setScene("curse");
      if (event.key === "2") setScene("summon");
      if (event.key === "3") setScene("prophecy");
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
  }, [setScene, setShowUI]);

  return (
    <>
      {currentScene === "curse" && <SceneCurse />}
      {currentScene === "summon" && <SceneSummon />}
      {currentScene === "prophecy" && <SceneProphecy />}
      {showUI && <UIOverlay />}
    </>
  );
}
