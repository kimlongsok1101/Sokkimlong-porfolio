"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type Message = {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string | null;
};

export default function MessageFeed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("id, name, email, content, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          if (!payload.new && !payload.old) {
            return;
          }

          setMessages((current) => {
            switch (payload.eventType) {
              case "INSERT":
                return [payload.new as Message, ...current];
              case "UPDATE":
                return current.map((message) =>
                  message.id === payload.new.id ? (payload.new as Message) : message
                );
              case "DELETE":
                return current.filter((message) => message.id !== payload.old.id);
              default:
                return current;
            }
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <section id="messages" className="py-20 px-6 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <p className="text-sm text-indigo-300 uppercase tracking-[0.25em]">Live Message Board</p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-100">
          Messages From Visitors
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          This feed updates instantly when the admin adds, edits, or removes messages.
        </p>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 text-slate-400">
            Loading messages...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
            {error}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 text-slate-400">
            No messages yet. The admin can add the first one from the dashboard.
          </div>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-300 uppercase tracking-[0.2em]">From</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{message.name}</p>
                <p className="text-sm text-slate-500">{message.email}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {message.created_at
                  ? new Date(message.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Unknown date"}
              </p>
            </div>

            <p className="mt-4 text-slate-300 leading-7">{message.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
