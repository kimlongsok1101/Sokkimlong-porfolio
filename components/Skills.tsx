"use client";

import { motion } from "framer-motion";
import { Cpu, Terminal, Database, Layout, Sparkles, Palette } from "lucide-react";
import { usePageSection } from "@/lib/usePageSection";
import { SkillsSectionPayload, defaultSkillsSection } from "@/lib/pageSectionDefaults";

// ==========================================
// Custom Tech & App SVG Brand Icons
// ==========================================
const ReactIcon = () => (
  <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="12" rx="10" ry="4.5" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const NextjsIcon = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.54 18.25l-5.83-8.28V17H10V7h1.9l5.58 7.95V7h1.72v11.25h-1.66z" />
  </svg>
);

const TypescriptIcon = () => (
  <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.306.34v2.458a3.95 3.95 0 00-1.29-.44 7.082 7.082 0 00-1.393-.133c-.702 0-1.22.132-1.554.397-.334.265-.501.65-.501 1.156 0 .332.073.6.219.805.146.205.353.376.621.513.268.137.587.258.957.363l.896.251c.783.218 1.408.472 1.874.761.467.289.816.65 1.048 1.082.232.433.348.96.348 1.583 0 .934-.326 1.684-.979 2.25-.653.566-1.579.849-2.778.849a11.58 11.58 0 01-1.921-.157 8.1 8.1 0 01-1.673-.473v-2.58a7.82 7.82 0 001.597.592c.602.155 1.192.232 1.77.232.723 0 1.258-.137 1.605-.41.347-.274.52-.66.52-1.159 0-.38-.088-.687-.264-.92-.176-.233-.425-.426-.747-.578-.322-.152-.713-.289-1.173-.411l-.81-.219c-.8-.218-1.432-.472-1.896-.762a3.07 3.07 0 01-1.048-1.096c-.22-.442-.33-.974-.33-1.597 0-.912.316-1.642.948-2.19.632-.548 1.51-.822 2.634-.822zm-7.64 0v2.302H8.381V21h-2.91V12.052H3.003V9.75h7.845z" />
  </svg>
);

const TailwindIcon = () => (
  <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
  </svg>
);

const NodejsIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.608l10.392 6v12L12 25.608l-10.392-6v-12L12 1.608zm0 2.308L3.608 8.5v10L12 23.192l8.392-4.692v-10L12 3.916z" />
  </svg>
);

const PostgresIcon = () => (
  <svg className="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
  </svg>
);

const GitIcon = () => (
  <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72 1.03 1.764.717 2.705L23.55 13.12c.602-.603.602-1.583-.004-2.19zM10.875 16.03c-.51-.51-.652-1.25-.436-1.891l-2.6-2.6a2.03 2.03 0 0 1-1.897.437L3.43 14.486c-.603.602-.603 1.582 0 2.187l10.48 10.478c.604.603 1.582.603 2.186 0l2.368-2.368-2.733-2.732a2.025 2.025 0 0 1-1.856-.021z" />
  </svg>
);

const PhotoshopIcon = () => (
  <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 0v24h24V0H0zm2 2h20v20H2V2zm4.5 4h3.8c2.1 0 3.5 1.1 3.5 2.9 0 1.9-1.4 2.9-3.5 2.9H8.5V18H6.5V6zm2 2v3.8h1.7c1 0 1.7-.5 1.7-1.4 0-.9-.7-1.4-1.7-1.4H8.5zm6.3 4.2c.8-.5 1.8-.8 2.7-.8 1.3 0 2 .6 2 1.6v.3c-.5-.2-1.1-.3-1.8-.3-1.6 0-2.7.7-2.7 2 0 1.2 1 2.2 2 1.2.7 1.8 1.2 2 1.2v.7c-.8.5-1.8.8-2.8.8-1.4 0-2.3-.7-2.3-1.8 0-.3.1-.6.2-.9z" />
  </svg>
);

const IllustratorIcon = () => (
  <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 0v24h24V0H0zm2 2h20v20H2V2zm6.2 4L5.1 18h2l.7-2.8h3.3l.7 2.8h2L10.7 6H8.2zm1.2 2.7l1.2 4.9H7.9l1.5-4.9zm6.1.1h2v9.2h-2V8.8zm0-2.8h2v2h-2V6z" />
  </svg>
);

const FigmaIcon = () => (
  <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 24c2.21 0 4-1.79 4-4v-4H8c-2.21 0-4 1.79-4 4s1.79 4 4 4zm0-16h4V0H8C5.79 0 4 1.79 4 4s1.79 4 4 4zm0 8c-2.21 0-4-1.79-4-4s1.79-4 4-4h4v8H8zm8-12c0-2.21-1.79-4-4-4v8c2.21 0 4-1.79 4-4zm0 8c0-2.21-1.79-4-4-4v8c2.21 0 4-1.79 4-4z" />
  </svg>
);

// Map of icon keys to components for dynamic rendering from DB payloads
const ICON_MAP: Record<string, any> = {
  ReactIcon,
  NextjsIcon,
  TypescriptIcon,
  TailwindIcon,
  NodejsIcon,
  PostgresIcon,
  PhotoshopIcon,
  IllustratorIcon,
  FigmaIcon,
  GitIcon,
  Layout,
  Palette,
  Cpu,
  Terminal,
  Database,
  Sparkles,
};

const DefaultSkillIcon = () => (
  <div className="w-6 h-6 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 text-[10px]">
    ?
  </div>
);

export default function Skills() {
  const { payload } = usePageSection("skills", defaultSkillsSection);
  const skillsData = payload as SkillsSectionPayload;
  const skillGroups = Array.isArray(skillsData.groups) && skillsData.groups.length > 0 ? skillsData.groups : defaultSkillsSection.groups;

  return (
    <section id="skills" className="py-24 px-6 max-w-6xl mx-auto relative overflow-hidden">
      {/* Animated Glowing Ambient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Animated Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3 shadow-lg shadow-indigo-500/10"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {/* Tech & Design Stack */}
          </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight"
        >
          {skillsData.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 text-sm max-w-lg mx-auto mt-2"
        >
          {skillsData.description}
        </motion.p>
      </motion.div>
      </div>

      {/* Skill Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {skillGroups.map((group, groupIdx) => {
          const CategoryIcon = typeof group.icon === "string" ? ICON_MAP[group.icon] ?? Layout : Layout;
          const skills = Array.isArray(group.skills) ? group.skills : [];
          return (
            <motion.div
              key={group.category + groupIdx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: groupIdx * 0.15, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col justify-between relative"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-colors"
                  >
                    <CategoryIcon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {group.category}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-6">{group.description}</p>

                {/* Skills Grid */}
                <div className="space-y-4">
                  {skills.map((skill, skillIdx) => {
                    const SkillIcon = skill.icon
                      ? typeof skill.icon === "function"
                        ? skill.icon
                        : ICON_MAP[skill.icon] ?? DefaultSkillIcon
                      : DefaultSkillIcon;
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: groupIdx * 0.1 + skillIdx * 0.08, duration: 0.4 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-inner"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: 12, scale: 1.1 }}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center"
                            >
                              <SkillIcon />
                            </motion.div>
                            <span className="text-sm font-semibold text-slate-200">
                              {skill.name}
                            </span>
                          </div>
                                        <span className="text-xs font-mono text-indigo-400 font-bold">
                                          {skill.level}
                                        </span>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: "0%" }}
                            whileInView={{ width: skill.level }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2 + skillIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-300 h-full rounded-full relative"
                          >
                            {/* Shimmer Light Pulse */}
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "linear" }}
                              className="absolute top-0 bottom-0 w-12 bg-white/30 skew-x-12"
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}