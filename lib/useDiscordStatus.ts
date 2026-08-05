import { useState, useEffect } from "react";

export interface LanyardActivity {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: {
    start: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps: {
      start: number;
      end: number;
    };
  };
  listening_to_spotify: boolean;
}

export function useDiscordStatus(discordId: string) {
  const [statusData, setStatusData] = useState<LanyardData | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStatusData(result.data);
        }
      })
      .catch((err) => console.error("Lanyard initial fetch error:", err));

    const connectWs = () => {
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            op: 2,
            d: { subscribe_to_id: discordId },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.op === 1) {
            const heartbeatPeriod = message.d.heartbeat_interval;
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(() => {
              ws?.send(JSON.stringify({ op: 3 }));
            }, heartbeatPeriod);
          }

          if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
            setStatusData(message.d);
          }
        } catch (e) {
          console.error("Failed to parse Lanyard WebSocket message", e);
        }
      };

      ws.onclose = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        setTimeout(connectWs, 3000);
      };

      ws.onerror = (err) => {
        console.error("Lanyard WebSocket error:", err);
        ws?.close();
      };
    };

    connectWs();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (ws) ws.close();
    };
  }, [discordId]);

  return statusData;
}