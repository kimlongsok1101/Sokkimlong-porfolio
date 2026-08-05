"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

type LoginHistoryRecord = {
  id: string;
  email: string;
  ip: string;
  status: string;
  deviceModel: string;
  deviceLocation: string;
  created_at: string | null;
};

const getMapsUrl = (location: string | null | undefined) => {
  if (!location) return null;
  const trimmed = String(location).trim();
  // If looks like "lat,lng" where lat/lng are numbers, use as-is
  if (/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
  }
  // Otherwise treat as address/place and let Google Maps handle it
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
};

export default function AdminHistoryPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [history, setHistory] = useState<LoginHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [postedLoginRecord, setPostedLoginRecord] = useState(false);

  const isAdmin = sessionEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    const loadSession = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        setFeedback("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        setAuthLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setSessionEmail(session.user.email);

        // If this is the configured admin email, post a login record so admin history captures
        // sign-ins regardless of provider (password or social). Use browser geolocation when available.
        try {
          if (session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !postedLoginRecord) {
            const postRecord = async (details: Record<string, unknown>) => {
              try {
                await fetch("/api/admin/login-history", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: session.user.email,
                    status: "success",
                    reason: "successful_login_client",
                    details,
                  }),
                });
              } catch (err) {
                // ignore network errors
              }
              setPostedLoginRecord(true);
            };

            const deviceModel = navigator?.userAgent ?? "Unknown device";

            if (typeof navigator !== "undefined" && navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const deviceLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                  postRecord({ deviceModel, deviceLocation });
                },
                () => {
                  // denied or unavailable
                  postRecord({ deviceModel });
                },
                { timeout: 5000 }
              );
            } else {
              // no geolocation available
              postRecord({ deviceModel });
            }
          }
        } catch (e) {
          // swallow errors - don't block UI
          setPostedLoginRecord(true);
        }
      }
      setAuthLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, sessionData) => {
        setSessionEmail(sessionData?.user?.email ?? null);
      });

      authListenerSubscription = data.subscription;
    };

    loadSession();
    return () => authListenerSubscription?.unsubscribe();
  }, []);

  const loadLoginHistory = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/login-history");
      const result = await response.json();
      if (!response.ok) {
        setFeedback(result.error ?? "Unable to load login history.");
        setHistory([]);
      } else {
        setHistory(result.data ?? []);
      }
    } catch {
      setFeedback("Unable to load login history.");
      setHistory([]);
    }

    setLoading(false);
  };

  const deleteHistoryRecord = async (id: string) => {
    if (!id) return;

    setDeletingId(id);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/login-history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (!response.ok) {
        setFeedback(result.error ?? "Unable to delete login history record.");
      } else {
        setHistory((current) => current.filter((record) => record.id !== id));
        setFeedback("Login history record deleted.");
      }
    } catch {
      setFeedback("Unable to delete login history record.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLoginHistory();
  }, [isAdmin]);

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
          <h1 className="text-3xl font-extrabold mb-4 text-slate-100">Admin Login Required</h1>
          <p className="text-sm text-slate-400 mb-8">
            You must be signed in as admin to view login history. Please visit the admin dashboard and sign in first.
          </p>
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Admin Login History</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-100">Admin login activity</h1>
              <p className="mt-2 text-slate-400 max-w-2xl">
                Showing recent admin signin attempts for <span className="text-indigo-300">{sessionEmail}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                Back to Dashboard
              </a>
              <button
                type="button"
                onClick={loadLoginHistory}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Refresh history
              </button>
            </div>
          </div>
          {feedback && (
            <div className="mt-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
              {feedback}
            </div>
          )}
        </header>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          {loading ? (
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
              Loading login history...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 text-slate-400">
              No login history records found.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-400">Connection location</p>
                      <p className="mt-1 text-slate-300 font-extrabold text-lg">
                        {record.deviceLocation || "Unknown location"}
                      </p>
                      {getMapsUrl(record.deviceLocation) ? (
                        <a
                          href={getMapsUrl(record.deviceLocation)!}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-300 text-sm hover:text-indigo-200"
                        >
                          View on Google Maps
                        </a>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Device</p>
                      <p className="text-slate-100 font-semibold">{record.deviceModel || "Unknown device"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="text-slate-100 font-semibold">{record.status}</p>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Date / time</p>
                        <p className="text-slate-100 font-semibold">
                          {record.created_at ? new Date(record.created_at).toLocaleString() : "Unknown"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteHistoryRecord(record.id)}
                        disabled={deletingId === record.id}
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === record.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
