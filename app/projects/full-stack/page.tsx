"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Code2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useProjects } from "@/lib/useProjects";
import type { Project } from "@/data/projects";

// Motion-enabled Next.js Link component (prevents legacyBehavior hydration errors)
const MotionLink = motion(Link);

// SVG icon for GitHub
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function FullstackProjects() {
  const { projects, loading, error } = useProjects("Full Stack Websites");

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
          <span>Back to Showcase</span>
        </MotionLink>
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Full Stack Websites
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Full stack web applications, APIs, and databases.
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
            className="group rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden hover:border-indigo-500/40 transition-all duration-300 shadow-xl"
          >
            {/* Image Banner */}
            <div className="relative w-full h-48 sm:h-52 bg-slate-950 overflow-hidden border-b border-slate-800/80">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={project.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Code2 className="w-10 h-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </div>

            {/* Project Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
                  {project.title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech Tags */}
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

              {/* Action Buttons (Live Demo & Source Code Only) */}
              <div className="flex items-center gap-3 pt-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Live Demo
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
                    aria-label="View Source Code"
                  >
                    <GithubIcon className="w-4 h-4" /> Code
                  </a>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </main>
  );
}