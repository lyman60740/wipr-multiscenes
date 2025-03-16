import { useEffect, useRef } from "react";

export function useTwitchChat(onMessageReceived) {
  const callbackRef = useRef(onMessageReceived);

  // Met à jour la référence du callback quand il change
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const eventSource = new EventSource("https://wipr-multiscenes-back.onrender.com/stream-chat");

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      callbackRef.current(data.message, data.user);
    };

    eventSource.onmessage = handleMessage;

    eventSource.onerror = (error) => {
      console.error("Erreur de connexion SSE :", error);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);
}
