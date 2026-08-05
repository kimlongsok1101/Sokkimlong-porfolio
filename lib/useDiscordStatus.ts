import { useState, useEffect } from "react";

export interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
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
  }>;
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
    fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStatusData(result.data);
        }
      })
      .catch((err) => console.error("Lanyard fetch error:", err));

    const ws = new WebSocket("wss://api.lanyard.rest/socket");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 2,
          d: { subscribe_to_id: discordId },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
          setStatusData(message.d);
        }
      } catch (e) {
        console.error("Failed to parse Lanyard WS message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [discordId]);

  return statusData;
}