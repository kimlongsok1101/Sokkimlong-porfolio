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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [messageForm, setMessageForm] = useState({ name: "", email: "", content: "" });

  const handleMessageFieldChange = (field: keyof typeof messageForm, value: string) => {
    setMessageForm((current) => ({ ...current, [field]: value }));
  };

  const submitMessage = async () => {
    setFeedback(null);

    if (!messageForm.name || !messageForm.email || !messageForm.content) {
      setFeedback("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageForm),
      });
      const result = await response.json();

      if (!response.ok) {
        setFeedback(result.error ?? "Unable to submit message.");
      } else {
        setFeedback("Message submitted successfully. Thank you!");
        setMessageForm({ name: "", email: "", content: "" });
        setMessages((current) => {
          if (Array.isArray(result.data)) {
            return [result.data[0] as Message, ...current];
          }
          return current;
        });
      }
    } catch (err) {
      setFeedback("Unable to submit message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const supabase = createSupabaseClient();

    let channel: any = null;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/messages");
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Unable to load messages.");
        } else if (result.data) {
          setMessages(result.data);
        }
      } catch (err) {
        setError("Unable to load messages.");
      }
      setLoading(false);
    };

    fetchMessages();

    if (supabase) {
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
    }

    return () => {
      if (supabase && channel) {
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
          Enjoying the content? If you'd like to support the channel and help me upgrade my setup (or keep me fueled on coffee during long streams), you can drop a tip right here!
        </p>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Please note: Tips are totally optional, never required, but insanely appreciated. Thank you for being awesome!
        </p>
        💬 Leave a Message: Drop a note with your donation so I can read it and shout you out on stream
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

        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">Leave a message</h3>
          <div className="grid gap-4">
            <input
              type="text"
              value={messageForm.name}
              onChange={(e) => handleMessageFieldChange("name", e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="email"
              value={messageForm.email}
              onChange={(e) => handleMessageFieldChange("email", e.target.value)}
              placeholder="Your email"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <textarea
              rows={4}
              value={messageForm.content}
              onChange={(e) => handleMessageFieldChange("content", e.target.value)}
              placeholder="Write your message here"
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {feedback ? (
              <p className="text-sm text-slate-300">{feedback}</p>
            ) : null}
            <button
              type="button"
              onClick={submitMessage}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
          </div>
        </div>

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
