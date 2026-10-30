import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_BREAK:   { id: "FIRST_BREAK",   label: "First Strike",    desc: "Destroy your first brick",          icon: "⚡", color: "#22d3ee" },
  COMBO_3:       { id: "COMBO_3",       label: "On Fire",         desc: "Reach a 3× combo",                  icon: "🔥", color: "#f97316" },
  COMBO_5:       { id: "COMBO_5",       label: "Unstoppable",     desc: "Reach a 5× combo",                  icon: "💥", color: "#ef4444" },
  LEVEL_5:       { id: "LEVEL_5",       label: "Veteran",         desc: "Reach level 5",                     icon: "🏅", color: "#eab308" },
  LEVEL_10:      { id: "LEVEL_10",      label: "Elite",           desc: "Reach level 10",                    icon: "🏆", color: "#a855f7" },
  BOSS_SLAYER:   { id: "BOSS_SLAYER",   label: "Boss Slayer",     desc: "Defeat your first boss",            icon: "💀", color: "#ff0055" },
  SCORE_1K:      { id: "SCORE_1K",      label: "Point Hunter",    desc: "Score 1,000 points",                icon: "⭐", color: "#fbbf24" },
  SCORE_5K:      { id: "SCORE_5K",      label: "High Roller",     desc: "Score 5,000 points",                icon: "🌟", color: "#fbbf24" },
  SCORE_10K:     { id: "SCORE_10K",     label: "Legend",          desc: "Score 10,000 points",               icon: "👑", color: "#c084fc" },
  MULTI_BALL:    { id: "MULTI_BALL",    label: "Ball Storm",      desc: "Have 3+ balls at once",             icon: "🎱", color: "#22c55e" },
  EXTRA_LIFE:    { id: "EXTRA_LIFE",    label: "Lucky Catch",     desc: "Collect an extra life",             icon: "❤️", color: "#f43f5e" },
  FIREBALL:      { id: "FIREBALL",      label: "Pyro",            desc: "Activate the Fireball",             icon: "🔥", color: "#ef4444" },
  SURVIVE_3:     { id: "SURVIVE_3",     label: "Resilient",       desc: "Complete a level with 1 life left", icon: "🛡", color: "#06b6d4" },
  MAGNET:        { id: "MAGNET",        label: "Magnetic",        desc: "Activate the Magnet power-up",      icon: "🧲", color: "#d946ef" },
};

// Queue-based toast system
export default function AchievementBadge({ achievements }) {
  const [queue, setQueue] = useState([]);
  const [shown, setShown] = useState(new Set());

  useEffect(() => {
    const newOnes = achievements.filter((id) => !shown.has(id));
    if (newOnes.length === 0) return;
    setShown((prev) => new Set([...prev, ...newOnes]));
    setQueue((prev) => [...prev, ...newOnes.map((id) => ({ id, key: `${id}_${Date.now()}` }))]);
  }, [achievements]);

  useEffect(() => {
    if (queue.length === 0) return;
    const timer = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, 3200);
    return () => clearTimeout(timer);
  }, [queue]);

  const current = queue[0];
  const info = current ? ACHIEVEMENTS[current.id] : null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <AnimatePresence mode="wait">
        {current && info && (
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md border shadow-lg"
            style={{
              background: `${info.color}18`,
              borderColor: `${info.color}55`,
              boxShadow: `0 0 20px ${info.color}44`,
            }}
          >
            <span className="text-xl leading-none">{info.icon}</span>
            <div className="flex flex-col leading-tight">
              <span className="font-orbitron text-xs font-bold tracking-wide" style={{ color: info.color }}>
                ACHIEVEMENT UNLOCKED
              </span>
              <span className="font-orbitron text-sm font-bold text-foreground">{info.label}</span>
              <span className="font-inter text-xs text-muted-foreground">{info.desc}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}