"use client";

import NextImage from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Terminal, Code2, Database, Music, Gamepad2, ExternalLink } from "lucide-react";
import { useEffect, useState, type MouseEvent, useRef } from "react";
import { usePageSection } from "@/lib/usePageSection";
import { defaultHeroSection } from "@/lib/pageSectionDefaults";
import { useDiscordStatus, LanyardActivity } from "@/lib/useDiscordStatus";

const codeSnippet = `const developer = {
  name: "Sokkimlong",
  role: "Full-Stack Software Developer",
  education: "Management Information Systems (MIS)",
  skills: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
  status: "Available for Hire"
};`;

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function HomeHero() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, setTick] = useState(0);

  const discordData = useDiscordStatus("745943593432121465");
  const lastTrackIdRef = useRef<string | null>(null);

  // High-performance ticker loop that forces immediate layout sync when mobile screen wakes up
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 250);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTick((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const getStatusConfig = () => {
    const rawStatus = discordData?.discord_status || "offline";
    switch (rawStatus) {
      case "online":
        return { color: "bg-emerald-400", ping: "animate-ping", label: "Online" };
      case "idle":
        return { color: "bg-amber-400", ping: "", label: "Idle" };
      case "dnd":
        return { color: "bg-rose-500", ping: "", label: "Do Not Disturb" };
      default:
        return { color: "bg-slate-500", ping: "", label: "Offline" };
    }
  };

  const currentStatus = getStatusConfig();

  const getParsedCards = (): Array<{
    key: string;
    type: string;
    title: string;
    name: string;
    details: string;
    image: string | null;
    smallImage?: string | null;
    icon: React.JSX.Element;
    progress?: number;
    elapsedFormatted?: string | null;
    durationFormatted?: string;
    trackId?: string;
  }> => {
    if (!discordData) return [];
    const cards = [];

    if (discordData.listening_to_spotify && discordData.spotify) {
      const { start, end } = discordData.spotify.timestamps;
      const startMs = start < 10000000000 ? start * 1000 : start;
      const endMs = end < 10000000000 ? end * 1000 : end;

      const duration = endMs - startMs;
      const currentTrackId = discordData.spotify.track_id;

      // Track change trigger
      if (lastTrackIdRef.current !== currentTrackId) {
        lastTrackIdRef.current = currentTrackId;
      }

      // Real-time live calculation matching desktop behavior
      const elapsed = Math.min(Math.max(Date.now() - startMs, 0), duration);
      const progressPercent = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;

      cards.push({
        key: "spotify",
        type: "spotify",
        title: "Listening to Spotify",
        name: discordData.spotify.song,
        details: discordData.spotify.artist,
        image: discordData.spotify.album_art_url,
        smallImage: null,
        icon: <Music className="w-3.5 h-3.5 text-emerald-400" />,
        progress: progressPercent,
        elapsedFormatted: formatTime(elapsed),
        durationFormatted: formatTime(duration),
        trackId: currentTrackId,
      });
    }

    if (discordData.activities && discordData.activities.length > 0) {
      discordData.activities.forEach((act: LanyardActivity, index: number) => {
        if (act.type === 4 || act.name.toLowerCase() === "spotify") return;

        let imageUrl = null;
        if (act.assets?.large_image) {
          const largeImage = act.assets.large_image;
          if (largeImage.startsWith("spotify:")) {
            imageUrl = `https://i.scdn.co/image/${largeImage.replace("spotify:", "")}`;
          } else if (largeImage.startsWith("mp:external/")) {
            imageUrl = `https://media.discordapp.net/external/${largeImage.replace("mp:external/", "")}`;
          } else if (largeImage.startsWith("https://") || largeImage.startsWith("http://")) {
            imageUrl = largeImage;
          } else if (act.application_id) {
            imageUrl = `https://cdn.discordapp.com/app-assets/${act.application_id}/${largeImage}.png`;
          }
        }

        let smallImageUrl = null;
        if (act.assets?.small_image) {
          const smallImage = act.assets.small_image;
          if (smallImage.startsWith("mp:external/")) {
            smallImageUrl = `https://media.discordapp.net/external/${smallImage.replace("mp:external/", "")}`;
          } else if (smallImage.startsWith("https://") || smallImage.startsWith("http://")) {
            smallImageUrl = smallImage;
          } else if (act.application_id) {
            smallImageUrl = `https://cdn.discordapp.com/app-assets/${act.application_id}/${smallImage}.png`;
          }
        }

        let elapsedFormatted = null;
        if (act.timestamps?.start) {
          const startMs = act.timestamps.start < 10000000000 ? act.timestamps.start * 1000 : act.timestamps.start;
          const elapsed = Math.max(Date.now() - startMs, 0);
          elapsedFormatted = formatTime(elapsed);
        }

        cards.push({
          key: `activity-${index}`,
          type: "app",
          title: act.type === 0 ? "Playing" : act.name,
          name: act.name,
          details: act.details || act.state || "",
          image: imageUrl,
          smallImage: smallImageUrl,
          icon: <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />,
          elapsedFormatted,
        });
      });
    }

    return cards;
  };

  const activityCards = getParsedCards();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const safariQuery = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios|edgios|opios/i.test(navigator.userAgent);

    const updateViewport = () => {
      setIsMobile(mediaQuery.matches || (touchQuery.matches && safariQuery));
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    touchQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
      touchQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);

    if (isMobile) {
      setDisplayedCode(codeSnippet);
      return;
    }

    let currentIndex = 0;
    let typingInterval: number | null = null;
    let restartTimeout: number | null = null;

    const startTyping = () => {
      setDisplayedCode("");
      currentIndex = 0;

      typingInterval = window.setInterval(() => {
        currentIndex += 1;
        setDisplayedCode(codeSnippet.slice(0, currentIndex));

        if (currentIndex >= codeSnippet.length) {
          if (typingInterval !== null) {
            window.clearInterval(typingInterval);
            typingInterval = null;
          }

          restartTimeout = window.setTimeout(() => {
            startTyping();
          }, 10000);
        }
      }, 20);
    };

    startTyping();

    return () => {
      if (typingInterval !== null) window.clearInterval(typingInterval);
      if (restartTimeout !== null) window.clearTimeout(restartTimeout);
    };
  }, [isMobile]);

  const handleScrollToAbout = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("about");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-center relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Background Animated Glow */}
      {!isMobile ? (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"
        />
      ) : (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />
      )}

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center z-10">
        
        {/* LEFT COLUMN: ID Card + Real-time Current Activity Container */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center w-full">
          <motion.div
            initial={{ y: -300, opacity: 0, rotate: -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="w-full max-w-sm bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative group hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />
            
            <div className="flex flex-col items-center text-center">
              
              {/* Profile Avatar Frame */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/30 p-1 mb-4 bg-slate-200 dark:bg-slate-950">
                <NextImage
                  src="/profile.jpg"
                  alt="Sokkimlong Profile Picture"
                  fill
                  priority
                  sizes="112px"
                  className="object-cover rounded-full"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Software Developer & Designer
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-wider transition-colors">SOKKIMLONG</h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs mt-1 transition-colors">SETEC Institute • MIS Year 1</p>

              <div className="mt-5 pt-4 border-t border-slate-300 dark:border-slate-800/80 w-full flex justify-around text-xs transition-colors">
                <div>
                  <span className="block text-slate-600 dark:text-slate-400 font-medium transition-colors">Major</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold transition-colors">MIS</span>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-800" />
                <div>
                  <span className="block text-slate-600 dark:text-slate-400 font-medium transition-colors">Status</span>
                  <a
                    href="https://discord.com/users/745943593432121465"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-300"
                    aria-label="Open Discord profile"
                  >
                    <span className="relative flex w-2 h-2">
                      {currentStatus.ping && (
                        <span className={`absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-75 ${currentStatus.ping}`} />
                      )}
                      <span className={`relative inline-flex rounded-full w-2 h-2 ${currentStatus.color}`} />
                    </span>
                    {currentStatus.label}
                  </a>
                </div>
              </div>

            </div>
          </motion.div>

          {/* CURRENT ACTIVITY BOX CONTAINER WITH ANIMATION */}
          {activityCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col gap-3 transition-colors"
            >
              <div className="flex items-center justify-between px-1 pt-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-colors">
                    Current Activity
                  </h3>
                </div>
              </div>

              {activityCards.map((card) => (
                <div 
                  key={card.key} 
                  className="w-full bg-slate-200 dark:bg-slate-950/70 border border-slate-400 dark:border-slate-800/80 p-3.5 rounded-2xl text-left relative overflow-hidden shadow-lg transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500/30"
                >
                  <span className="block text-[10px] font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">
                    {card.title}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    {card.image ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-300 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 transition-colors">
                        <NextImage
                          src={card.image}
                          alt="Thumbnail"
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        {card.smallImage && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-900 bg-slate-300 dark:bg-slate-950 transition-colors">
                            <NextImage src={card.smallImage} alt="Badge" fill sizes="20px" className="object-cover" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        {card.icon}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate transition-colors">
                        {card.name}
                      </span>
                      {card.details && (
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate transition-colors">
                          {card.details}
                        </span>
                      )}
                    </div>
                  </div>

                  {card.type === "spotify" && card.progress !== undefined && card.progress !== null ? (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-1 transition-colors">
                        <span>{card.elapsedFormatted}</span>
                        <span>{card.durationFormatted}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden mb-3 transition-colors">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-300 ease-linear"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                      
                      {/* Play on Spotify Button */}
                      {card.trackId && (
                        <a
                          href={`https://open.spotify.com/track/${card.trackId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-200 flex items-center justify-center gap-2 transition-all"
                        >
                          <Music className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Play on Spotify</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </a>
                      )}
                    </div>
                  ) : card.elapsedFormatted ? (
                    <div className="mt-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-400 dark:border-slate-800/50 transition-colors">
                      <span>🎮</span>
                      <span>{card.elapsedFormatted}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Code Editor Box */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" /> developer.ts — Sokkimlong Portfolio
            </div>
            <div className="w-12" />
          </div>

          <div className="p-6 font-mono text-xs sm:text-sm text-indigo-300 leading-relaxed overflow-x-auto min-h-[200px]">
            <pre>
              <code>{isMounted ? displayedCode : ""}</code>
              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
            </pre>
          </div>

          <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Code2 className="w-3.5 h-3.5" /> Next.js 14
            </span>
            <span className="flex items-center gap-1.5 text-pink-400">
              <Database className="w-3.5 h-3.5" /> Management Information Systems
            </span>
          </div>
        </motion.div>

      </div>

      {/* Smooth Scroll Button */}
      {isMobile ? (
        <a
          href="#about"
          onClick={(event) => {
            event.preventDefault();
            const target = document.getElementById("about");
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="mt-12 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-400 text-xs font-mono uppercase tracking-widest transition-colors z-10"
        >
          <span>[ Scroll down ]</span>
          <ArrowDown className="w-4 h-4 text-indigo-400" />
        </a>
      ) : (
        <motion.a
          href="#about"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 1 }, y: { repeat: Infinity, duration: 1.8 } }}
          onClick={handleScrollToAbout}
          className="mt-12 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-400 text-xs font-mono uppercase tracking-widest transition-colors z-10"
        >
          <span>[ Scroll down ]</span>
          <ArrowDown className="w-4 h-4 text-indigo-400" />
        </motion.a>
      )}
    </section>
  );
}