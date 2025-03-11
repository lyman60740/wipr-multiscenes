export function useTwitchChat(onMessageReceived) {
    useEffect(() => {
      const eventSource = new EventSource("https://wipr-multiscenes-back.vercel.app/stream-chat");
  
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
  