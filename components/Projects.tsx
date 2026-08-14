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

      {/* Main Single Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mt-8"
      >
        <Link
          href="/projects"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-2xl transition-transform duration-200 hover:scale-105"
        >
          {projectData.buttonLabel ?? "View My Project"}
          <ArrowRight className="w-4 h-4 opacity-90" />
        </Link>
      </motion.div>
    </section>
  );
}