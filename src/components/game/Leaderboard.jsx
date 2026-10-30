import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard({ onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Score.list("-score", 10).then((data) => {
      setScores(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-xl z-20 p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="font-orbitron text-2xl font-bold text-foreground">LEADERBOARD</h2>
      </div>

      {loading ? (
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : scores.length === 0 ? (
        <p className="text-muted-foreground font-inter text-sm">No scores yet. Be the first!</p>
      ) : (
        <div className="w-full max-w-xs space-y-2">
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border"
            >
              <span className={`font-orbitron text-sm w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                {i + 1}
              </span>
              <span className="font-inter text-sm text-foreground flex-1 truncate">{s.player_name}</span>
              <span className="font-orbitron text-sm text-primary">{s.score.toLocaleString()}</span>
              <span className="font-inter text-xs text-muted-foreground">Lv{s.level}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}