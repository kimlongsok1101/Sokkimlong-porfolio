"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Terminal, Code2, Database } from "lucide-react";
import { useState, useEffect } from "react";

const codeSnippet = `const developer = {
  name: "Sokkimlong",
  role: "Full-Stack Software Developer",
  education: "Management Information Systems (MIS)",
  skills: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
  status: "Available for Hire"
};`;

export default function HomeHero() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Mark as mounted on the client to avoid SSR hydration mismatch
    setIsMounted(true);

    // 2. Typing effect
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedCode(codeSnippet.slice(0, index));
      index++;
      if (index > codeSnippet.length) clearInterval(interval);
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-center relative pt-28 pb-16 px-6 overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Background Animated Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10">
        
        {/* LEFT COLUMN: Dropping ID Card */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div
            initial={{ y: -300, opacity: 0, rotate: -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="w-full max-w-sm bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative group hover:border-indigo-500/50 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />
            
            <div className="flex flex-col items-center text-center">
              
              {/* Local Picture Avatar Frame */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/30 p-1 mb-4 bg-slate-950">
                <Image
                  src="/profile.jpg"
                  alt="Sokkimlong Profile Picture"
                  fill
                  priority
                  sizes="112px"
                  className="object-cover rounded-full"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Software Developer & Designer
              </div>

              <h1 className="text-2xl font-black text-slate-100 tracking-wider">SOKKIMLONG</h1>
              <p className="text-indigo-400 font-medium text-xs mt-1">SETEC Institute • MIS Year 1</p>

              <div className="mt-5 pt-4 border-t border-slate-800/80 w-full flex justify-around text-xs">
                <div>
                  <span className="block text-slate-400 font-medium">Major</span>
                  <span className="text-slate-200 font-bold">MIS</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="block text-slate-400 font-medium">Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Online
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Interactive Code Editor Box */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          {/* Terminal Header */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> developer.ts — Sokkimlong Portfolio
            </div>
            <div className="w-12" />
          </div>

          {/* Typing Code Content */}
          <div className="p-6 font-mono text-xs sm:text-sm text-indigo-300 leading-relaxed overflow-x-auto min-h-[200px]">
            <pre>
              <code>{isMounted ? displayedCode : ""}</code>
              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
            </pre>
          </div>

          {/* Code Footer Badge Row */}
          <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Code2 className="w-3.5 h-3.5" /> Next.js 14
            </span>
            <span className="flex items-center gap-1.5 text-pink-400">
              <Database className="w-3.5 h-3.5" /> Management Information Systems
            </span>
          </div>
        </motion.div>

      </div>

      {/* Smooth Scroll Button */}
      <motion.a
        href="#about"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1 }, y: { repeat: Infinity, duration: 1.8 } }}
        className="mt-12 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-400 text-xs font-mono uppercase tracking-widest transition-colors z-10"
      >
        <span>[ Scroll down ]</span>
        <ArrowDown className="w-4 h-4 text-indigo-400" />
      </motion.a>
    </section>
  );
}