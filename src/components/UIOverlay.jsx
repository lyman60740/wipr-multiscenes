export default function UIOverlay() {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontSize: "24px",
        }}
      >
        {/* AJOUTER LES CONTROLES ORBIT */}
        <p>1 - Curse</p>
        <p>2 - Summon</p>
        <p>3 - Prophecy</p>
        <p>(Maintenir TAB pour voir cette aide)</p>
      </div>
    );
  }
  