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
    <section id="projects" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-80 h-48 sm:h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Description (matches screenshot style) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative z-10 mb-8 sm:mb-10"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-3 sm:mb-4">{projectData.headline}</h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto mb-2 sm:mb-3 px-2 sm:px-0">{projectData.description}</p>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto px-2 sm:px-0">Browse selected projects showcasing frontend, full-stack, and design work.</p>
      </motion.div>

      {/* Animated Box with Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        className="relative z-10 mt-10 sm:mt-12 mb-8 p-6 sm:p-8 rounded-lg sm:rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-400/60 transition-colors duration-300 backdrop-blur-sm"
      >
        <div className="text-center">
          <FolderKanban className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-indigo-400" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-100 mb-2">Featured Projects</h3>
          <p className="text-xs sm:text-sm lg:text-base text-slate-300 mb-5 sm:mb-6 px-2 sm:px-0">Explore my latest work and creative solutions</p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {projectData.buttonLabel ?? "View My Project"}
            <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 opacity-90" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}