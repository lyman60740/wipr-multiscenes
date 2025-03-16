import { useEffect, useRef } from "react";

export function useTwitchChat(onMessageReceived) {
  const callbackRef = useRef(onMessageReceived);

  // Met à jour toujours la référence du callback
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);
  useEffect(() => {
    console.log("useTwitchChat monté");
  }, []);
  useEffect(() => {
    const eventSource = new EventSource("https://wipr-multiscenes-back.onrender.com/stream-chat");

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      callbackRef.current(data.message, data.user);
    };

    eventSource.addEventListener("message", handleMessage);

    eventSource.onerror = (error) => {
      console.error("Erreur de connexion SSE :", error);
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("message", handleMessage);
      eventSource.close();
    };
  }, []);
}
