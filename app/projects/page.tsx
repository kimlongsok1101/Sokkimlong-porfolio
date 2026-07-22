"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Code2, Palette, Layout, ArrowRight, ArrowLeft } from "lucide-react";

// Motion-enabled Next.js Link component to match the other pages
const MotionLink = motion(Link);

const projectCategories = [
  {
    name: "Full Stack",
    href: "/projects/full-stack",
    description: "Web apps with backend APIs, databases, and banking integrations.",
    icon: Code2,
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "Design",
    href: "/projects/design",
    description: "UI/UX prototypes, branding kits, Figma & Photoshop assets.",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Frontend",
    href: "/projects/frontend",
    description: "Interactive user interfaces built with React, Next.js & Tailwind.",
    icon: Layout,
    color: "from-sky-500 to-indigo-600",
  },
];

export default function ProjectsPage() {
  return (
    <main className="py-24 px-6 max-w-5xl mx-auto relative overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Boxed Back Button */}
      <div className="mb-8 relative z-10">
        <MotionLink
          href="/"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 text-xs font-mono text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/80 shadow-lg shadow-indigo-500/5 transition-colors duration-200 cursor-pointer"
        >
          <motion.div
            variants={{
              hover: { x: -4 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
          </motion.div>
          <span>Back to Home</span>
        </MotionLink>
      </div>

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3"
        >
          <Sparkles className="w-3.5 h-3.5" /> Featured Works
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
          Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-300">Project Type</span>
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">
          Choose a section below to explore dedicated project showcases.
        </p>
      </div>

      {/* 3 Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {projectCategories.map((category) => {
          const Icon = category.icon;

          return (
            <motion.div
              key={category.name}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={category.href}
                className="group relative flex flex-col justify-between h-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 shadow-xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} opacity-60 group-hover:opacity-100 transition-opacity`}
                />

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
                    {category.name}
                  </h2>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>View Projects</span>
                  <div className="p-2 rounded-xl bg-slate-950 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}