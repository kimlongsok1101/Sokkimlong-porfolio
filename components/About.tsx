"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, BookOpen, Laptop, FileText, Download, Eye, X, ExternalLink } from "lucide-react";

// ==========================================
// Custom Brand SVG Icons
// ==========================================
const TelegramIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const socialLinks = [
  {
    name: "Telegram",
    handle: "@sok_kimlong",
    href: "https://t.me/sok_kimlong",
    color: "from-sky-500 to-blue-600",
    glow: "hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:border-sky-500/50",
    icon: TelegramIcon,
  },
  {
    name: "Instagram",
    handle: "@BearxBenz",
    href: "https://instagram.com/sokkimlong",
    color: "from-pink-500 via-rose-500 to-amber-500",
    glow: "hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:border-rose-500/50",
    icon: InstagramIcon,
  },
  {
    name: "Discord",
    handle: "@long_0",
    href: "https://discordapp.com/users/745943593432121465",
    color: "from-indigo-500 to-violet-600",
    glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:border-indigo-500/50",
    icon: DiscordIcon,
  },
];

export default function About() {
  const [isOpenCvModal, setIsOpenCvModal] = useState(false);
  const cvPath = "/cv.pdf";

  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3"
        >
          <User className="w-3.5 h-3.5" /> // About Me
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Who is <span className="text-indigo-400">Sokkimlong</span>?
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Bio & Highlights & CV Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Full-Stack Developer & MIS Specialist
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Hi! I&apos;m <strong className="text-white">Sokkimlong</strong>. I combine software development skills with business technology through my degree in <strong className="text-indigo-400">Management Information Systems (MIS)</strong> at SETEC Institute.
          </p>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            I build modern web applications with sleek UI design, clear user experiences, and responsive performance using Next.js, React, and Tailwind CSS.
          </p>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 text-xs font-mono">Major</span>
                <span className="text-slate-200 font-bold text-sm">MIS Major</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-slate-400 text-xs font-mono">Focus</span>
                <span className="text-slate-200 font-bold text-sm">Web & Systems</span>
              </div>
            </div>
          </div>

          {/* CV ACTION BUTTONS */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
            {/* View CV Popup Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOpenCvModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View MY CV</span>
            </motion.button>

            {/* Download CV File Button */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={cvPath}
              download="SOKKIMLONG-CV.pdf"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Download CV</span>
            </motion.a>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Social Media Cards */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 space-y-4"
        >
          <div className="mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">// Social Channels</span>
            <h4 className="text-lg font-bold text-slate-100">Connect With Me</h4>
          </div>

          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 ${social.glow}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon />
                  </div>
                  <div>
                    <h5 className="text-slate-100 font-bold text-sm group-hover:text-white transition-colors">
                      {social.name}
                    </h5>
                    <p className="text-slate-400 font-mono text-xs">{social.handle}</p>
                  </div>
                </div>

                <div className="text-slate-500 group-hover:text-indigo-400 font-mono text-xs transition-colors pr-2">
                  →
                </div>
              </motion.a>
            );
          })}
        </motion.div>

      </div>

      {/* POPUP MODAL FOR CV PREVIEW */}
      <AnimatePresence>
        {isOpenCvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenCvModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Curriculum Vitae — Sokkimlong</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={cvPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open Tab</span>
                  </a>
                  <a
                    href={cvPath}
                    download="SOKKIMLONG-CV.pdf"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsOpenCvModal(false)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body / PDF Viewer */}
              <div className="flex-1 bg-slate-950 relative">
                <object
                  data={cvPath}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <iframe
                    src={cvPath}
                    title="SOKKIMLONG CV Preview"
                    className="w-full h-full border-none"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
                      <p className="mb-4">Your browser cannot render inline PDFs directly.</p>
                      <a
                        href={cvPath}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
                      >
                        Open PDF Directly
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}