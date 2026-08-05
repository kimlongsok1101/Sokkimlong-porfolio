"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Menu, X, Code2, Bell, Moon, Sun } from "lucide-react";

const NotificationsPanel = dynamic(() => import("@/components/NotificationsPanel"), {
  ssr: false,
  loading: () => null,
});

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Support", href: "#support" },
  { name: "Contact", href: "#contact" },
  { name: "Admin", href: "/admin" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);

          const sections = navLinks.map((link) => link.href.substring(1));
          const current = sections.find((section) => {
            const el = document.getElementById(section);
            if (el) {
              const rect = el.getBoundingClientRect();
              return rect.top <= 120 && rect.bottom >= 120;
            }
            return false;
          });

          if (current) setActiveSection(current);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;

    setTheme(nextTheme);
    setMounted(true);
    document.documentElement.classList.toggle("light", nextTheme === "light");
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Lock body scroll ONLY when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Smooth scroll handler fixed for mobile
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // 1. Immediately close the mobile menu and unfreeze body scrolling
    setMobileMenuOpen(false);
    document.body.style.overflow = "unset";

    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    // 2. Small delay to let the menu close animation start before scrolling
    setTimeout(() => {
      if (targetElement) {
        const useSmoothScroll = !window.matchMedia("(max-width: 768px)").matches;
        targetElement.scrollIntoView({ behavior: useSmoothScroll ? "smooth" : "auto", block: "start" });
        setActiveSection(targetId);
      } else {
        window.location.hash = href;
      }
    }, 50);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-2xl shadow-indigo-950/10"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex items-center gap-2 font-mono font-extrabold text-slate-100 text-lg group z-50"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/50 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <span>
            SOKKIMLONG<span className="text-indigo-400">.SITE</span>
          </span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-4 py-2 rounded-full text-xs font-mono transition-colors ${
                  isActive ? "text-slate-100 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Active Indicator Glow Capsule */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: "spring", duration: 0.5 }}
                    className="absolute inset-0 bg-indigo-600/30 border border-indigo-500/50 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Notification & CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative inline-flex items-center rounded-full border border-slate-800 bg-slate-900/80 p-1 text-slate-300 hover:border-indigo-500/30 hover:text-slate-100 transition-colors"
            aria-label="Toggle theme"
          >
            <div className="relative h-8 w-16 rounded-full bg-slate-800/90 p-1">
              <motion.div
                animate={{ left: theme === "dark" ? 4 : 36 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">☀</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">🌙</span>
            </div>
          </button>

          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-indigo-500/30 transition-colors group"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <a
            href="#support"
            onClick={(e) => handleNavClick(e, "#support")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-mono font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
          >
            <Code2 className="w-3.5 h-3.5" /> Support Me
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer z-50"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden bg-slate-950/95 border-b border-slate-800 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4 font-mono text-sm">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`py-2 border-b border-slate-900 transition-colors ${
                      isActive ? "text-indigo-400 font-bold" : "text-slate-300 hover:text-indigo-400"
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}

              <button
                type="button"
                onClick={toggleTheme}
                className="py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors flex items-center justify-between"
                aria-label="Toggle theme"
              >
                <span>{mounted && theme === "dark" ? "Light" : "Dark"}</span>
                {mounted && theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => {
                  setNotificationsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors flex items-center justify-between"
              >
                <span>Notifications</span>
              </button>

              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="mt-2 text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors"
              >
                Let&apos;s Talk
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </header>
  );
}