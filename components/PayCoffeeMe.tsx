"use client";

import { useState } from "react";
import { Coffee, X } from "lucide-react";

export default function PayCoffeeMe() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="support" className="relative mx-auto max-w-5xl px-6 py-24">
      <div className="rounded-3xl border border-amber-500/20 bg-slate-900/90 p-8 shadow-2xl shadow-amber-950/20 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-mono text-amber-300">
              <Coffee className="h-4 w-4" /> Pay Coffee Me
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-100 sm:text-4xl">Support my work</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              If you like what I do and want to support my work, a small tip goes a long way. Thank you for your generosity!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Show bank QR
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300">Bank QR</p>
                <h3 className="mt-1 text-xl font-bold text-slate-100">Scan to support</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-950/80 p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
                aria-label="Close bank QR popup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-6 text-center">
              <img
                src="/qr.jpg"
                alt="Bank QR code"
                className="mx-auto max-h-[32rem] w-full max-w-md rounded-3xl object-contain"
              />
              <p className="mt-5 text-sm text-slate-400">
                Scan the QR code from your bank app to send support. Replace <code className="rounded bg-slate-800 px-1 py-0.5 text-amber-200">And</code> Thank you for Buy me a coffee! ☕
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
