import { useEffect, useRef } from "react";
import tmi from "tmi.js";

export function useTwitchChat(onMessageReceived) {
  const callbackRef = useRef(onMessageReceived);

  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    console.log("useTwitchChat monté (frontend-only)");

    const client = new tmi.Client({
      connection: { reconnect: true },
      channels: ["wipr"] // Nom de la chaîne à écouter
    });

    client.connect().catch(console.error);

    const handleMessage = (channel, tags, message, self) => {
      if (self) return;
      console.log("Twitch message reçu :", tags.username, message);
      callbackRef.current(message, tags.username);
    };

    client.on("message", handleMessage);

    return () => {
      client.removeListener("message", handleMessage);
      client.disconnect();
    };
  }, []);
}
