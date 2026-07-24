"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Palette, Eye, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/lib/useProjects";
import type { Project } from "@/data/projects";

// Motion-enabled Next.js Link component
const MotionLink = motion(Link);

export default function FrontendProjects() {
  const { projects, loading, error } = useProjects("Frontend");

  // Selected image for the modal popup
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  return (
    <main className="py-20 px-6 max-w-5xl mx-auto min-h-screen flex flex-col justify-center">
      {/* Animated Boxed Back Button */}
      <div className="mb-8">
        <MotionLink
          href="/projects"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 text-xs font-mono text-slate-300 hover:text-white hover:border-purple-500/40 hover:bg-slate-800/80 shadow-lg shadow-purple-500/5 transition-colors duration-200 cursor-pointer"
        >
          <motion.div
            variants={{
              hover: { x: -4 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
          </motion.div>
          <span>Back to Showcase</span>
        </MotionLink>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Palette className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Fontend Websites
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Frontend web applications, landing pages, and UI components.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project: Project) => {
          const imageSrc = project.image
            ? /^(https?:\/\/|\/|data:)/.test(project.image)
              ? project.image
              : `/${project.image}`
            : null;

          return (
          <div
            key={project.id}
            className="group rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden hover:border-purple-500/40 transition-all duration-300 shadow-xl"
          >
            {/* Image Preview Area */}
            <div className="relative w-full h-56 bg-slate-950 overflow-hidden border-b border-slate-800/80">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={project.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Palette className="w-10 h-10" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-purple-300 transition-colors">
                  {project.title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech/Design Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {imageSrc && (
                  <button
                    onClick={() =>
                      setSelectedImage({
                        src: imageSrc,
                        title: project.title,
                      })
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                )}

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                    aria-label="View Link"
                  >
                    <ExternalLink className="w-4 h-4" /> Link
                  </a>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Smooth Popup Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setSelectedImage(null)}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
                mass: 0.8,
              }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col items-center shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between px-2 pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-sm font-semibold text-slate-200">
                  {selectedImage.title}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-90"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Image Display */}
              <div className="relative w-full h-[65vh] sm:h-[75vh] rounded-2xl overflow-hidden bg-slate-950">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}