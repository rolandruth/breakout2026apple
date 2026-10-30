import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isBossLevel } from "../../lib/gameLogic";

export default function LevelTransition({ level, visible, onDone }) {
  const isBoss = isBossLevel(level);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl pointer-events-none"
          style={{ background: isBoss ? "rgba(255,0,50,0.18)" : "rgba(10,8,30,0.72)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            {isBoss ? (
              <>
                <span className="font-orbitron text-5xl font-black text-destructive drop-shadow-lg" style={{ textShadow: "0 0 30px #ff0055" }}>
                  ⚠ BOSS
                </span>
                <span className="font-orbitron text-xl font-bold text-destructive/80 tracking-widest">LEVEL {level}</span>
                <span className="font-inter text-sm text-destructive/60 mt-1 animate-pulse">Prepare yourself…</span>
              </>
            ) : (
              <>
                <span className="font-orbitron text-2xl text-muted-foreground tracking-[0.4em] uppercase">Level</span>
                <span
                  className="font-orbitron text-7xl font-black bg-gradient-to-b from-white via-primary to-accent bg-clip-text text-transparent"
                  style={{ textShadow: "0 0 40px #a855f755" }}
                >
                  {level}
                </span>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}