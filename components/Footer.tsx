export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 transition-colors duration-500">© {new Date().getFullYear()} SOKKIMLONG. All rights reserved.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">Crafted with Next.js, Tailwind CSS, and passion.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono uppercase tracking-[0.18em]">
          <a href="#home" className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">Home</a>
          <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">About</a>
          <a href="#skills" className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">Skills</a>
          <a href="#projects" className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">Projects</a>
          <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500">Contact</a>
        </div>
      </div>
    </footer>
  );
}
