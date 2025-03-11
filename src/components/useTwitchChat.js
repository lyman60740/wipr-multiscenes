import { useEffect } from "react";
import tmi from "tmi.js";

export function useTwitchChat(channelName, onMessageReceived) {
  useEffect(() => {
    const client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: import.meta.env.VITE_TWITCH_USERNAME,
        password: import.meta.env.VITE_TWITCH_OAUTH_TOKEN,
      },
      channels: [channelName],
    });

    client.connect();

    client.on("message", (channel, tags, message, self) => {
      if (self) return;
      onMessageReceived(message, tags);
    });

    return () => {
      client.disconnect();
    };
  }, [channelName, onMessageReceived]);
}
