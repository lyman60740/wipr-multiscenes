import { useState, useEffect, useRef, useCallback } from "react";

export function useTwitchChat(onMessageReceived) {
    useEffect(() => {
      const eventSource = new EventSource("https://wipr-multiscenes-back.onrender.com/stream-chat");
  
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessageReceived(data.message, data.user);
      };
  
      eventSource.onerror = (error) => {
        console.error("Erreur de connexion SSE :", error);
        eventSource.close();
      };
  
      return () => eventSource.close();
    }, [onMessageReceived]);
  }
  