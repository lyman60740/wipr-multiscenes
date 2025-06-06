import { useEffect, useState } from "react";
import "./FadeTransition.css"; // on va créer ce fichier

export default function FadeTransition({ visible, children, duration = 800 }) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setAnimClass("fade-in");
    } else {
      setAnimClass("fade-out");
      const timeout = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timeout);
    }
  }, [visible, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fade-container ${animClass}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
