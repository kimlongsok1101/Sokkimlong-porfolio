"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-6 max-w-4xl mx-auto text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        <Link
          href="/projects"
          className="group inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FolderKanban className="w-5 h-5" />
          </div>

          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              Explore Projects Showcase
            </h3>
            <p className="text-xs text-slate-400">
              Browse Fullstack, Design & Frontend categories
            </p>
          </div>

          <div className="ml-2 p-2 rounded-lg bg-slate-950 text-indigo-400 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </motion.div>
    </section>
  );
}