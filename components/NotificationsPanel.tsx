"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, ExternalLink } from "lucide-react";
import { useNotifications } from "@/lib/useNotifications";

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

  const getProjectLink = (notification: any) => {
    if (notification.projectCategory) {
      const categoryMap: { [key: string]: string } = {
        "Design": "/projects/design",
        "Frontend": "/projects/frontend",
        "Full Stack Websites": "/projects/full-stack",
      };
      return categoryMap[notification.projectCategory] || "/projects";
    }
    return "/projects";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/50 dark:bg-black/50 z-40 transition-colors"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">Notifications</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                    {unreadCount > 0 ? `${unreadCount} new` : "All caught up"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400 transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-6 text-center text-slate-600 dark:text-slate-400 transition-colors">
                  <p>Loading...</p>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-50 transition-colors" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm transition-colors">No notifications yet</p>
                </div>
              )}

              {!loading && notifications.length > 0 && (
                <div className="divide-y divide-slate-200 dark:divide-slate-800/80 transition-colors">
                  {notifications.map((notification) => {
                    const projectLink = notification.projectId ? getProjectLink(notification) : null;
                    const imageSrc = notification.projectImage
                      ? /^(https?:\/\/|\/)/.test(notification.projectImage)
                        ? notification.projectImage
                        : `/${notification.projectImage}`
                      : null;

                    const NotificationContent = (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 hover:bg-slate-200 dark:hover:bg-slate-900/50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-indigo-100 dark:bg-indigo-500/5" : ""
                        }`}
                      >
                        {/* Project Image Preview */}
                        {imageSrc && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-colors">
                            <Image
                              src={imageSrc}
                              alt={notification.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 320px"
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className="text-xl pt-0.5 flex-shrink-0">{getIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm transition-colors">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 line-clamp-2 transition-colors">
                                {notification.description}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-500 mt-2 transition-colors">
                                {new Date(notification.created_at).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          {projectLink && (
                            <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
                          )}
                        </div>
                      </motion.div>
                    );

                    return projectLink ? (
                      <Link key={notification.id} href={projectLink} onClick={onClose}>
                        {NotificationContent}
                      </Link>
                    ) : (
                      <div key={notification.id}>{NotificationContent}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && notifications.length > 0 && unreadCount > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800/80 p-4 transition-colors">
                <button
                  onClick={markAllAsRead}
                  className="w-full py-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 hover:bg-indigo-200 dark:hover:bg-indigo-500/20 border border-indigo-400 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
