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

type Subscriber = (data: LanyardData) => void;

type SocketEntry = {
  ws: WebSocket | null;
  subscribers: Set<Subscriber>;
  latest: LanyardData | null;
  heartbeatTimer: number | null;
  reconnectTimer: number | null;
  reconnectAttempts: number;
};

const socketMap = new Map<string, SocketEntry>();

function createEntry(): SocketEntry {
  return {
    ws: null,
    subscribers: new Set(),
    latest: null,
    heartbeatTimer: null,
    reconnectTimer: null,
    reconnectAttempts: 0,
  };
}

function notifySubscribers(entry: SocketEntry) {
  if (!entry.latest) return;
  entry.subscribers.forEach((cb) => {
    try {
      cb(entry.latest as LanyardData);
    } catch (e) {
      // ignore individual subscriber errors
      // eslint-disable-next-line no-console
      console.error("Lanyard subscriber error:", e);
    }
  });
}

function connect(discordId: string) {
  const key = String(discordId);
  let entry = socketMap.get(key);
  if (!entry) {
    entry = createEntry();
    socketMap.set(key, entry);
  }

  if (entry.ws && (entry.ws.readyState === WebSocket.OPEN || entry.ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    entry.ws = new WebSocket("wss://api.lanyard.rest/socket");
  } catch (e) {
    console.error("Lanyard create WebSocket failed:", e);
    scheduleReconnect(discordId);
    return;
  }

  entry.ws.onopen = () => {
    entry.reconnectAttempts = 0;
    try {
      entry.ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
    } catch (e) {
      console.error("Lanyard send subscribe failed:", e);
    }
  };

  entry.ws.onmessage = (ev) => {
    try {
      const message = JSON.parse(ev.data as string);
      if (message.op === 1 && message.d && message.d.heartbeat_interval) {
        // heartbeat
        if (entry!.heartbeatTimer) window.clearInterval(entry!.heartbeatTimer);
        const period = Number(message.d.heartbeat_interval) || 30_000;
        entry!.heartbeatTimer = window.setInterval(() => {
          try {
            entry!.ws?.send(JSON.stringify({ op: 3 }));
          } catch (e) {
            // sending may fail if socket closed; will be handled by onerror/onclose
          }
        }, period);
      }

      if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
        entry!.latest = message.d as LanyardData;
        notifySubscribers(entry!);
      }
    } catch (e) {
      console.error("Lanyard parse message error:", e);
    }
  };

  entry.ws.onclose = () => {
    if (entry!.heartbeatTimer) window.clearInterval(entry!.heartbeatTimer);
    entry!.heartbeatTimer = null;
    entry!.ws = null;
    scheduleReconnect(discordId);
  };

  entry.ws.onerror = (err) => {
    // Log safely
    let info = "";
    try {
      if (err && typeof err === "object") {
        if ("type" in err && (err as any).type) {
          info = String((err as any).type);
        } else {
          try {
            info = JSON.stringify(err);
          } catch {
            info = String(err);
          }
        }
      } else {
        info = String(err);
      }
    } catch (e) {
      info = "Unknown WebSocket error";
    }
    // Silently handle WebSocket errors - reconnection is handled by scheduleReconnect
    // onerror may be followed by onclose; close to ensure cleanup
    try {
      entry!.ws?.close();
    } catch (e) {
      // ignore
    }
  };
}

function scheduleReconnect(discordId: string) {
  const key = String(discordId);
  const entry = socketMap.get(key);
  if (!entry) return;
  if (entry.reconnectTimer) return; // already scheduled
  // exponential backoff
  const attempt = Math.min(6, entry.reconnectAttempts || 0);
  const delay = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 1000);
  entry.reconnectAttempts = (entry.reconnectAttempts || 0) + 1;
  entry.reconnectTimer = window.setTimeout(() => {
    entry!.reconnectTimer = null;
    // only reconnect if there are active subscribers
    if (entry && entry.subscribers.size > 0) {
      connect(discordId);
    }
  }, delay);
}

function closeAndCleanup(discordId: string) {
  const key = String(discordId);
  const entry = socketMap.get(key);
  if (!entry) return;
  if (entry.heartbeatTimer) window.clearInterval(entry.heartbeatTimer);
  if (entry.reconnectTimer) window.clearTimeout(entry.reconnectTimer);
  try {
    entry.ws?.close();
  } catch (e) {}
  socketMap.delete(key);
}

export function useDiscordStatus(discordId: string) {
  const [statusData, setStatusData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!discordId) return;
    const key = String(discordId);
    let entry = socketMap.get(key);
    if (!entry) {
      entry = createEntry();
      socketMap.set(key, entry);
    }

    const subscriber: Subscriber = (data) => setStatusData(data);
    entry.subscribers.add(subscriber);

    // Ensure connection
    connect(discordId);

    // If we already have latest, use it
    if (entry.latest) setStatusData(entry.latest);

    return () => {
      const e = socketMap.get(key);
      if (!e) return;
      e.subscribers.delete(subscriber);
      // if no subscribers left, cleanup the socket to avoid leaking
      if (e.subscribers.size === 0) {
        closeAndCleanup(discordId);
      }
    };
  }, [discordId]);

  return statusData;
}
