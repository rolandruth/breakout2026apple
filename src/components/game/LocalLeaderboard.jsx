import React from "react";
import { motion } from "framer-motion";
import { Trophy, X, Medal } from "lucide-react";

const STORAGE_KEY = "breakout2026_local_scores";

export function getLocalScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalScore(score, level) {
  const scores = getLocalScores();
  scores.push({ score, level, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  return top;
}

export default function LocalLeaderboard({ onClose }) {
  const scores = getLocalScores();

  const rankStyle = (i) => {
    if (i === 0) return { color: "#fbbf24" };
    if (i === 1) return { color: "#94a3b8" };
    if (i === 2) return { color: "#f97316" };
    return { color: "#6b7280" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-xl z-30 flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="font-orbitron text-xl font-bold tracking-wider text-foreground">LOCAL BEST</h2>
      </div>

      {scores.length === 0 ? (
        <p className="text-muted-foreground font-inter text-sm">No scores yet. Play a game!</p>
      ) : (
        <div className="w-full max-w-xs flex flex-col gap-2">
          {scores.map((entry, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border"
              style={{ borderColor: i < 3 ? rankStyle(i).color + "44" : "#ffffff11", background: i < 3 ? rankStyle(i).color + "11" : "transparent" }}
            >
              <Medal className="w-4 h-4 shrink-0" style={rankStyle(i)} />
              <span className="font-orbitron text-sm font-bold flex-1" style={rankStyle(i)}>
                {entry.score.toLocaleString()}
              </span>
              <span className="font-inter text-xs text-muted-foreground">Lv {entry.level}</span>
              <span className="font-inter text-xs text-muted-foreground/50">{entry.date}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}