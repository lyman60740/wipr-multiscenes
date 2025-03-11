import { useState, useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useTwitchChat } from "./useTwitchChat";

export function VoteMessages3D({ onSacrifice, channelName }) {
  const [votes, setVotes] = useState([]);
  const [voteCount, setVoteCount] = useState({});
  const [topVotes, setTopVotes] = useState([]);
  const [sacrified, setSacrified] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showRanking, setShowRanking] = useState(true);
  const [chronoOpacity, setChronoOpacity] = useState(1);
  const [sacrifiedOpacity, setSacrifiedOpacity] = useState(0);
  

  useTwitchChat(channelName, (message, tags) => {
    const match = message.match(/^!sacrifice\s+@?(\w+)/i);
    if (match) {
      const pseudo = match[1];
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
  });

  // Chrono qui décrémente chaque seconde
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Quand le chrono arrive à 0, on cache le classement et on déclenche le sacrifice
  useEffect(() => {
    if (timeLeft === 0) {
      setShowRanking(false);
      if (topVotes.length > 0) {
        const victime = topVotes[0][0];
        setSacrified(victime);
        onSacrifice(victime);

        // Fade out chrono
        const fadeChrono = setInterval(() => {
          setChronoOpacity(op => {
            if (op <= 0.05) {
              clearInterval(fadeChrono);
              setChronoOpacity(0);

              // Fade in sacrifié
              const fadeSacrified = setInterval(() => {
                setSacrifiedOpacity(sop => {
                  if (sop >= 0.95) {
                    clearInterval(fadeSacrified);
                    return 1;
                  }
                  return sop + 0.05;
                });
              }, 50);

              return 0;
            }
            return op - 0.05;
          });
        }, 50);
      }
    }
  }, [timeLeft, topVotes, onSacrifice]);

 

  return (
    <group>
      {votes.map(vote => (
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
          <Text font="/fonts/CloisterBlack.ttf" fontSize={0.15} color="white" anchorX="left" anchorY="middle">
            Classement :
          </Text>
          {topVotes.map(([pseudo, count], index) => (
            <Text
              key={pseudo}
              position={[0, -(index + 1) * 0.2, 0]}
              fontSize={0.15}
              color="white"
              anchorX="left"
              anchorY="middle"
              font="/fonts/CloisterBlack.ttf"
            >
              {index + 1}. {pseudo} : {count} vote{count > 1 ? "s" : ""}
            </Text>
          ))}
        </group>
      )}

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
    </group>
  );
}

function VoteMessage3D({ vote }) {
  const ref = useRef();
  const startTime = vote.time;

  useFrame(() => {
    if (ref.current) {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < 2) {
        const progress = elapsed / 2;
        ref.current.position.y = -2 + progress * 2;
        const newOpacity = 1 - progress;
        ref.current.material.opacity = newOpacity;
        ref.current.material.transparent = true;
      } else {
        ref.current.position.y = 0;
        ref.current.material.opacity = 0;
        ref.current.material.transparent = true;
      }
    }
  });

  return (
    <Text
      ref={ref}
      position={[vote.x, -2, -2]}
      fontSize={0.15}
      color="red"
      anchorX="center"
      anchorY="middle"
      font="/fonts/CloisterBlack.ttf"
    >
      {vote.pseudo} +1 🔥
    </Text>
  );
}

