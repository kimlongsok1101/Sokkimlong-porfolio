import { useEffect, useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export type Notification = {
  id: string;
  type: "project" | "section" | "message";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
  projectId?: string;
  projectImage?: string;
  projectCategory?: string;
};

function normalizeNotificationRow(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    created_at: row.created_at,
    read: row.read,
    projectId: row.projectId ?? row.projectid ?? undefined,
    projectImage: row.projectImage ?? row.projectimage ?? undefined,
    projectCategory: row.projectCategory ?? row.projectcategory ?? undefined,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    const loadNotifications = async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (data) {
          const normalized = data.map(normalizeNotificationRow);
          setNotifications(normalized);
          setUnreadCount(normalized.filter((n) => !n.read).length);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Create a unique channel name to avoid conflicts
    const channelName = `notifications_${Math.random()}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: true } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotification = normalizeNotificationRow(payload.new);
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.debug("Channel subscription status:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const supabase = createSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from("notifications").delete().eq("id", id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const notif = notifications.find((n) => n.id === id);
        return notif && !notif.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, [notifications]);

  // NOTE: deleteNotification is kept for admin use only
  // Users cannot delete notifications via UI

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
