
import "./SceneSelector.css";

export default function SceneSelector({ onSelect }) {
  const audio = new Audio("/chant.mp3");
  audio.volume = 0.3;

  const handleClick = (scene) => {
    audio.play().catch(err => console.warn("Audio bloqué :", err));
    onSelect(scene);
  };

  return (
    <div className="selector">
      <button onClick={() => handleClick("curse")}>Curse</button>
      <button onClick={() => handleClick("summon")}>Sacrifice</button>
      <button onClick={() => handleClick("prophecy")}>Prophecy</button>
    </div>
  );
}

