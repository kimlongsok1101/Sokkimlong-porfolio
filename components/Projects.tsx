"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { usePageSection } from "@/lib/usePageSection";
import { ProjectsSectionPayload, defaultProjectsSection } from "@/lib/pageSectionDefaults";

export default function ProjectsSection() {
  const { payload } = usePageSection("projects", defaultProjectsSection);
  const projectData = payload as ProjectsSectionPayload;

  return (
    <section id="projects" className="py-20 px-6 max-w-4xl mx-auto text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Description (matches screenshot style) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">{projectData.headline}</h2>
        <p className="text-slate-300 max-w-3xl mx-auto mb-3">{projectData.description}</p>
        <p className="text-slate-400 max-w-3xl mx-auto">Browse selected projects showcasing frontend, full-stack, and design work.</p>
      </motion.div>

      {/* Animated Box with Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        className="relative z-10 mt-12 mb-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-400/60 transition-colors duration-300 backdrop-blur-sm"
      >
        <div className="text-center">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
          <h3 className="text-xl font-semibold text-slate-100 mb-2">Featured Projects</h3>
          <p className="text-slate-300 mb-6">Explore my latest work and creative solutions</p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-2xl transition-transform duration-200 hover:scale-105"
          >
            {projectData.buttonLabel ?? "View My Project"}
            <ArrowRight className="w-4 h-4 opacity-90" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}