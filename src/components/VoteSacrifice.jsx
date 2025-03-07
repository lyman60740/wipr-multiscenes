import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simule des messages Twitch entrants
const fakeMessages = [
  "!sacrifie @Jean",
  "!sacrifie @Marie",
  "!sacrifie @Paul",
  "!sacrifie @Jean",
  "!sacrifie @Alice",
  "!sacrifie @Paul",
  "!sacrifie @Marie",
  "!sacrifie @Alice",
  "!sacrifie @Paul",
  "!sacrifie @Jean",
  "!sacrifie @Jean",
  "!sacrifie @Alice",
];

export default function VoteSacrifice({ onSacrifice }) {
  const [votes, setVotes] = useState([]);
  const [voteCount, setVoteCount] = useState({});
  const [topVotes, setTopVotes] = useState([]);
  const [sacrified, setSacrified] = useState(null);

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < fakeMessages.length) {
        const message = fakeMessages[messageIndex];
        messageIndex++;

        // Extraction du pseudo après "!sacrifie "
        const match = message.match(/^!sacrifie\s+@(\w+)/);
        if (match) {
          const pseudo = match[1];

          // Ajouter le vote temporaire pour affichage
          setVotes((prev) => [...prev, pseudo]);

          // Mettre à jour le comptage des votes
          setVoteCount((prev) => {
            const updated = { ...prev, [pseudo]: (prev[pseudo] || 0) + 1 };
            const sorted = Object.entries(updated)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);
            setTopVotes(sorted);
            return updated;
          });

          // Supprimer le vote visuel après 2 secondes
          setTimeout(() => {
            setVotes((prev) => prev.filter((v) => v !== pseudo));
          }, 2000);
        }
      } else {
        clearInterval(interval);
      }
    }, 200); // Nouveaux votes toutes les 0.8s

    // Déclenchement du sacrifice après 20 secondes
    setTimeout(() => {
      if (topVotes.length > 0) {
        const victime = topVotes[0][0]; // Pseudo avec le plus de votes
        setSacrified(victime);
        onSacrifice(victime); // Déclenche l'animation principale
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [topVotes]);

  return (
    <div style={{ position: "absolute", top: 10, left: 10, color: "white", zIndex: 99 }}>
      <h2>🩸 VOTES EN COURS 🩸</h2>
      <AnimatePresence>
        {votes.map((pseudo, index) => (
          <motion.div
            key={pseudo + index}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ marginBottom: 5, fontSize: "18px", fontWeight: "bold", color: "red" }}
          >
            {pseudo} +1 🔥
          </motion.div>
        ))}
      </AnimatePresence>

      <h3>🔺 Top 3 des sacrifices :</h3>
      {topVotes.map(([pseudo, count]) => (
        <div key={pseudo} style={{ fontSize: "18px", fontWeight: "bold" }}>
          {pseudo} ({count} votes)
        </div>
      ))}

      {sacrified && (
        <h1 style={{ marginTop: 20, color: "yellow", fontSize: "24px" }}>⚰️ {sacrified} est sacrifié ! ⚰️</h1>
      )}
    </div>
  );
}
