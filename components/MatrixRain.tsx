"use client";

import { useEffect, useRef, useState } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios|edgios|opios/i.test(navigator.userAgent);

    const updateRenderState = () => {
      const shouldEnable = !mediaQuery.matches && !reducedMotionQuery.matches && !(touchQuery.matches && isSafari);
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      setShouldRender(shouldEnable && isDark);
    };

    updateRenderState();
    mediaQuery.addEventListener("change", updateRenderState);
    reducedMotionQuery.addEventListener("change", updateRenderState);
    touchQuery.addEventListener("change", updateRenderState);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      setShouldRender(!mediaQuery.matches && !reducedMotionQuery.matches && !(touchQuery.matches && isSafari) && isDark);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mediaQuery.removeEventListener("change", updateRenderState);
      reducedMotionQuery.removeEventListener("change", updateRenderState);
      touchQuery.removeEventListener("change", updateRenderState);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = 1;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const characters = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = window.innerWidth < 1024 ? 9 : 12;
    const columns = Math.max(1, Math.floor(window.innerWidth / fontSize));
    const drops: number[] = Array(columns).fill(1);

    let animationFrameId = 0;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;

    const draw = (timestamp: number) => {
      if (document.hidden) {
        animationFrameId = window.requestAnimationFrame(draw);
        return;
      }

      if (timestamp - lastFrameTime < frameInterval) {
        animationFrameId = window.requestAnimationFrame(draw);
        return;
      }

      lastFrameTime = timestamp;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.fillStyle = "rgba(2, 6, 23, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#6366f1";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-25"
    />
  );
}