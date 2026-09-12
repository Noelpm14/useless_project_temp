"use client";
import { useMotionValue, useMotionTemplate, motion } from "motion/react";
import React, { useState, useEffect, useMemo, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
const INITIAL_TEXT = CHARS.repeat(200).slice(0, 18000);

export const EvervaultBackground = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [mounted, setMounted] = useState(false);
  const [matrixText, setMatrixText] = useState(INITIAL_TEXT);

  useEffect(() => {
    setMounted(true);
    let ticking = false;
    let lastShuffleTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const now = Date.now();
      if (now - lastShuffleTime > 120 && !ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const arr = INITIAL_TEXT.split("");
          for (let i = 0; i < 250; i++) {
            const idx = Math.floor(Math.random() * arr.length);
            arr[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          setMatrixText(arr.join(""));
          lastShuffleTime = Date.now();
          ticking = false;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const maskImage = useMotionTemplate`radial-gradient(360px at ${mouseX}px ${mouseY}px, white 0%, rgba(255,255,255,0.7) 45%, transparent 100%)`;
  const style = useMemo(() => ({ maskImage, WebkitMaskImage: maskImage }), [maskImage]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden select-none bg-[#0e0e10]">
      {/* 1. Ambient low-opacity matrix grid everywhere */}
      <div className="absolute inset-0 opacity-15 overflow-hidden font-mono text-[11px] text-accent/70 font-semibold leading-[13px] tracking-[0.1em] break-all select-none p-1 pointer-events-none w-full h-full">
        {INITIAL_TEXT}
      </div>

      {/* 2. Intense amber radial glow spotlight under cursor */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent/45 via-amber-500/35 to-accent/30 opacity-95 pointer-events-none"
        style={style}
      />

      {/* 3. Shifting glowing matrix text spotlighted under cursor */}
      <motion.div
        className="absolute inset-0 opacity-100 mix-blend-screen pointer-events-none"
        style={style}
      >
        <p className="absolute inset-0 text-[11px] h-full break-all text-amber-300 font-mono font-black leading-[13px] tracking-[0.1em] select-none p-1 w-full drop-shadow-[0_0_10px_rgba(217,151,83,0.9)]">
          {matrixText}
        </p>
      </motion.div>
    </div>
  );
};
