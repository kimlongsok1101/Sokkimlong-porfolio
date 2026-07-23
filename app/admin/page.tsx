"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

type Message = {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string | null;
};

export default function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [messageForm, setMessageForm] = useState({ name: "", email: "", content: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isAdmin = useMemo(
    () => sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    [sessionEmail]
  );

  useEffect(() => {
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const loadSession = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        setFeedback(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        setAuthLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setSessionEmail(session.user.email);
      }
      setAuthLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, sessionData) => {
        setSessionEmail(sessionData?.user?.email ?? null);
      });

      authListenerSubscription = data.subscription;
    };

    loadSession();

    return () => {
      authListenerSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const loadMessages = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, name, email, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setFeedback(error.message);
      setMessages([]);
    } else if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setFeedback(error.message);
    } else {
      const userEmail = data.session?.user?.email ?? form.email;
      setSessionEmail(userEmail);
      setFeedback("Signed in successfully.");
      if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        loadMessages();
      }
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSessionEmail(null);
    setMessages([]);
    setLoading(false);
  };

  const createMessage = async () => {
    if (!messageForm.name || !messageForm.email || !messageForm.content) {
      setFeedback("Please fill all message fields before creating.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("messages")
      .insert([messageForm])
      .select();

    if (error) {
      setFeedback(error.message);
    } else if (data?.length) {
      setFeedback("Message created.");
      setMessageForm({ name: "", email: "", content: "" });
      setMessages((current) => [data[0], ...current]);
    }
    setLoading(false);
  };

  const updateMessage = async () => {
    if (!editId) {
      return;
    }

    const target = messages.find((message) => message.id === editId);
    if (!target) {
      setFeedback("Message not found.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("messages")
      .update({ name: target.name, email: target.email, content: target.content })
      .eq("id", editId)
      .select();

    if (error) {
      setFeedback(error.message);
    } else {
      setFeedback("Message updated.");
      setEditId(null);
      if (data?.length) {
        setMessages((current) =>
          current.map((message) => (message.id === editId ? data[0] : message))
        );
      }
    }
    setLoading(false);
  };

  const deleteMessage = async (id: string) => {
    setLoading(true);
    const supabase = createSupabaseClient();
    if (!supabase) {
      setFeedback(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      setFeedback(error.message);
    } else {
      setFeedback("Message deleted.");
      setMessages((current) => current.filter((message) => message.id !== id));
    }
    setLoading(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setMessageForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditFieldChange = (id: string, field: string, value: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, [field]: value } : message
      )
    );
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-10 shadow-xl">
          Loading admin auth state...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800/90 bg-slate-900/90 p-10 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-extrabold mb-4 text-slate-100">Admin Login</h1>
          <p className="text-sm text-slate-400 mb-8">
            Sign in with the admin account to manage visitor messages. Only the configured admin email may access this dashboard.
          </p>

          <label className="block mb-4">
            <span className="text-slate-300 text-sm">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <label className="block mb-6">
            <span className="text-slate-300 text-sm">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          {feedback && <p className="text-sm text-rose-300 mb-4">{feedback}</p>}

          <button
            type="button"
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? "Signing in..." : "Sign in as admin"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Admin Dashboard</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-100">Message management</h1>
              <p className="mt-2 text-slate-400 max-w-2xl">
                Logged in as <span className="text-indigo-300">{sessionEmail}</span>. Add, edit, or delete visitor messages and watch the public page update live.
              </p>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>

          {feedback && (
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
              {feedback}
            </div>
          )}
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Create new message</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-slate-400">Name</span>
                <input
                  value={messageForm.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400">Email</span>
                <input
                  value={messageForm.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400">Message</span>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <button
                type="button"
                onClick={createMessage}
                disabled={loading}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {loading ? "Saving..." : "Create message"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Message stats</h2>
            <p className="text-slate-400 mb-4">
              Total messages: <span className="font-semibold text-slate-100">{messages.length}</span>
            </p>
            <p className="text-slate-400 text-sm">
              This admin panel writes directly to the Supabase `messages` table. The public app can subscribe to realtime updates and reflect changes immediately.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-slate-100">Manage Messages</h2>
            <button
              type="button"
              onClick={loadMessages}
              className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
              Loading messages...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
              No messages to manage.
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => {
              const editing = editId === message.id;

              return (
                <div
                  key={message.id}
                  className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3 w-full">
                      <div>
                        <label className="text-sm text-slate-400">Name</label>
                        <input
                          value={message.name}
                          onChange={(event) => handleEditFieldChange(message.id, "name", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Email</label>
                        <input
                          value={message.email}
                          onChange={(event) => handleEditFieldChange(message.id, "email", event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Message</label>
                        <textarea
                          rows={4}
                          value={message.content}
                          onChange={(event) => handleEditFieldChange(message.id, "content", event.target.value)}
                          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:w-44">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(editing ? null : message.id);
                        }}
                        className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        {editing ? "Editing" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessage(message.id)}
                        className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                      >
                        Delete
                      </button>
                      {editing && (
                        <button
                          type="button"
                          onClick={updateMessage}
                          className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                        >
                          Save changes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
