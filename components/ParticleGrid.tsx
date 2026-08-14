"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");

    const updateRenderState = () => {
      const should = !mediaQuery.matches && !reducedMotionQuery.matches && !touchQuery.matches;
      setShouldRender(should);
    };

    updateRenderState();
    mediaQuery.addEventListener("change", updateRenderState);
    reducedMotionQuery.addEventListener("change", updateRenderState);
    touchQuery.addEventListener("change", updateRenderState);

    return () => {
      mediaQuery.removeEventListener("change", updateRenderState);
      reducedMotionQuery.removeEventListener("change", updateRenderState);
      touchQuery.removeEventListener("change", updateRenderState);
    };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Generate particles (kept conservative for performance)
    const baseCount = Math.floor((canvas.width * canvas.height) / 15000);
    const particleCount = Math.min(baseCount, 200);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 1.5 + 1,
    }));
    let animationFrameId: number;
    let lastFrame = 0;
    const frameInterval = 1000 / 30; // cap to ~30fps

    const animate = (timestamp?: number) => {
      if (timestamp && timestamp - lastFrame < frameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp || performance.now();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.7)";
        ctx.fill();

        // Connect nearby particles with lines (skip some checks for performance)
        if (particles.length <= 150) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${1 - dist / 120})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [shouldRender]);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
}