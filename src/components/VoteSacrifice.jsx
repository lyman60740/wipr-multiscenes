import { useState, useEffect, useRef, useCallback } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useTwitchChat } from "./useTwitchChat";

export function VoteMessages3D({ onSacrifice }) {
  const [votes, setVotes] = useState([]);
  const [voteCount, setVoteCount] = useState({});
  const [topVotes, setTopVotes] = useState([]);
  const [sacrified, setSacrified] = useState(null);
  const [timeLeft, setTimeLeft] = useState(40);
  const [showRanking, setShowRanking] = useState(true);
  const [chronoOpacity, setChronoOpacity] = useState(1);
  const [sacrifiedOpacity, setSacrifiedOpacity] = useState(0);
  const [votesEnabled, setVotesEnabled] = useState(true); // Nouvel état

  const handleChatMessage = useCallback((message, user) => {
    if (!votesEnabled) return; // Ne plus accepter les votes après la fin du chrono

    console.log(`Message reçu de ${user}: ${message}`);

    const match = message.match(/^!(sacrifice|sacrifie)\s+@?(\w+)/i);
    if (match) {
      const pseudo = match[2];
      const id = Date.now() + Math.random();
      const x = Math.random() * 15 - 7.5;
      const newVote = { id, pseudo, time: Date.now(), x };

      setVotes(prev => [...prev, newVote]);
      setVoteCount(prev => {
        const updated = { ...prev, [pseudo]: (prev[pseudo] || 0) + 1 };
        const sorted = Object.entries(updated)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        setTopVotes(sorted);
        return updated;
      });

      setTimeout(() => {
        setVotes(prev => prev.filter(vote => vote.id !== id));
      }, 2000);
    }
  }, [votesEnabled]);

  useTwitchChat(handleChatMessage);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && topVotes.length > 0) {
      setShowRanking(false);
      setVotesEnabled(false); // Bloque les nouveaux votes et l'affichage des existants
      setVotes([]); // Supprime immédiatement les votes existants à l'écran
      const victime = topVotes[0][0];
      setSacrified(victime);
      onSacrifice(victime);
      setChronoOpacity(0);
      setSacrifiedOpacity(1);
    }
  }, [timeLeft, topVotes, onSacrifice]);

  return (
    <group>
      {votesEnabled && votes.map(vote => (
        <VoteMessage3D key={vote.id} vote={vote} />
      ))}

      {sacrified && (
        <Text
          position={[0, -.3, -1.5]}
          fontSize={0.30}
          color="white"
          anchorX="center"
          anchorY="center"
          font="/fonts/CloisterBlack.ttf"
          material-transparent
          material-opacity={sacrifiedOpacity}
        >
          {sacrified}
        </Text>
      )}

      {showRanking && (
        <group position={[-3, -1.5, 0]}>
          <Text fontSize={0.15} color="white" anchorX="left" anchorY="middle" font="/fonts/CloisterBlack.ttf">
            Classement :
          </Text>
          {topVotes.map(([pseudo, count], index) => (
            <Text key={pseudo} position={[0, -(index + 1) * 0.2, 0]} fontSize={0.15} color="white" anchorX="left" anchorY="middle" font="/fonts/CloisterBlack.ttf">
              {index + 1}. {pseudo} : {count} vote{count > 1 ? "s" : ""}
            </Text>
          ))}
        </group>
      )}

      {showRanking && (
        <Text
          position={[-0.06, -.1, -1.7]}
          fontSize={0.7}
          color="white"
          anchorX="center"
          anchorY="center"
          font="/fonts/CloisterBlack.ttf"
          material-transparent
          material-opacity={chronoOpacity}
        >
          {timeLeft}
        </Text>
      )}
    </group>
  );
}

function VoteMessage3D({ vote }) {
  const ref = useRef();
  const startTime = vote.time;

  useFrame(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed < 2) {
      ref.current.position.y = -2 + (elapsed / 2) * 2;
      ref.current.material.opacity = 1 - elapsed / 2;
      ref.current.material.transparent = true;
    }
  });

  return (
    <Text ref={ref} position={[vote.x, -2, -2]} fontSize={0.15} color="red" anchorX="center" anchorY="middle" font="/fonts/CloisterBlack.ttf">
      {vote.pseudo} +1 🔥
    </Text>
  );
}
