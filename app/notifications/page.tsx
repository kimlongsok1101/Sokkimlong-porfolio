"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Trash2, CheckCheck, AlertCircle } from "lucide-react";
import { useNotifications } from "@/lib/useNotifications";

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAllAsRead, deleteNotification } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "project":
        return "📦";
      case "section":
        return "✏️";
      case "message":
        return "💬";
      default:
        return "📢";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">Notifications</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {unreadCount > 0 ? `${unreadCount} new` : "All caught up"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors"
              >
                <CheckCheck className="w-4 h-4 inline mr-2" />
                Mark all read
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 text-center text-slate-400">
            Loading notifications...
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-12 text-center"
          >
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">No notifications yet</p>
          </motion.div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`group rounded-2xl border transition-all duration-300 p-4 flex items-start justify-between gap-4 ${
                  !notification.read
                    ? "bg-indigo-500/5 border-indigo-500/30 hover:border-indigo-500/50"
                    : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="text-2xl pt-1">{getIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-100">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
