"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { usePageSection } from "@/lib/usePageSection";
import { ContactSectionPayload, defaultContactSection } from "@/lib/pageSectionDefaults";

// Platform Official SVG Icons
const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.411-.168.56-.374.748-.574.766-.435.038-.766-.288-1.186-.564-.658-.431-1.03-.698-1.668-1.118-.738-.486-.26-.754.161-1.19.11-.114 2.019-1.85 2.056-2.008.005-.02.009-.096-.035-.136-.044-.04-.109-.026-.156-.015-.067.015-1.134.721-3.2 2.118-.303.208-.577.31-.822.304-.27-.006-.79-.152-1.176-.278-.474-.154-.85-.236-.817-.498.017-.137.2-.278.549-.423 2.152-.937 3.588-1.555 4.308-1.854 2.052-.855 2.478-1.003 2.756-1.008.061 0 .198.015.287.088.075.062.096.146.104.205.008.06.018.196.012.304z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function Contact() {
  const { payload } = usePageSection("contact", defaultContactSection);
  const contactData = payload as ContactSectionPayload;

  const socialLinks = [
    {
      name: "Telegram",
      handle: "@sok_kimlong",
      url: "https://t.me/sok_kimlong",
      icon: TelegramIcon,
      hoverClass: "hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]",
      iconBoxClass: "group-hover:bg-sky-500/10 group-hover:border-sky-500/30 text-sky-400",
    },
    {
      name: "Instagram",
      handle: "bearxbenz",
      url: "https://www.instagram.com/bearxbenz/?hl=en",
      icon: InstagramIcon,
      hoverClass: "hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(244,114,182,0.15)]",
      iconBoxClass: "group-hover:bg-pink-500/10 group-hover:border-pink-500/30 text-pink-400",
    },
    {
      name: "Facebook",
      handle: "LoNg",
      url: "https://www.facebook.com/long.596686/",
      icon: FacebookIcon,
      hoverClass: "hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      iconBoxClass: "group-hover:bg-blue-500/10 group-hover:border-blue-500/30 text-blue-400",
    },
    {
      name: "Discord",
      handle: "long_0",
      url: "https://discordapp.com/users/745943593432121465",
      icon: DiscordIcon,
      hoverClass: "hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.15)]",
      iconBoxClass: "group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 text-indigo-400",
    },
  ];

  // Properly typed Framer Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-5xl mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3 cursor-default"
        >
          <Sparkles className="w-3.5 h-3.5" /> Connect With Me
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {contactData.heading}
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
          {contactData.subheading}
        </p>
      </motion.div>

      {/* Social Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto relative z-10 mb-8"
      >
        {socialLinks.map((social) => {
          const Icon = social.icon;

          return (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group p-5 bg-slate-900/80 border border-slate-800/90 rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-between ${social.hoverClass}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-slate-950 rounded-xl border border-slate-800 transition-all duration-300 ${social.iconBoxClass}`}>
                  <Icon />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {social.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {social.handle}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </motion.a>
          );
        })}
      </motion.div>

      {/* Location Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="max-w-2xl mx-auto flex items-center justify-center gap-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl relative z-10"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <p className="text-xs font-mono text-slate-300">
          Based in Phnom Penh, Cambodia • Open for opportunities
        </p>
      </motion.div>
    </section>
  );
}