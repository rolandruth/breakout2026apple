import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, X, Globe, User } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalLeaderboard({ onClose, onSubmitScore, score, level, gameOver }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => localStorage.getItem("breakout2026_name") || "");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(gameOver ? "submit" : "board");

  useEffect(() => {
    base44.entities.Score.list("-score", 10).then((data) => {
      setScores(data);
      setLoading(false);
    });
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    localStorage.setItem("breakout2026_name", name.trim());
    await base44.entities.Score.create({ player_name: name.trim(), score, level });
    setSubmitting(false);
    setSubmitted(true);
    setTab("board");
  };

  const rankColor = (i) => i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#f97316" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-xl z-30 flex flex-col items-center p-6 pt-10"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-yellow-400" />
        <h2 className="font-orbitron text-xl font-bold tracking-wider text-foreground">GLOBAL LEADERBOARD</h2>
      </div>

      {/* Tabs */}
      {gameOver && (
        <div className="flex gap-2 mb-4">
          {[{ id: "submit", label: "Submit Score" }, { id: "board", label: "Top 10" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="font-orbitron text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: tab === t.id ? "#a855f7" : "#ffffff22",
                background: tab === t.id ? "#a855f722" : "transparent",
                color: tab === t.id ? "#a855f7" : "#94a3b8",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Submit */}
      {tab === "submit" && gameOver && !submitted && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <div className="text-center mb-2">
            <p className="font-orbitron text-2xl text-foreground">{score.toLocaleString()}</p>
            <p className="font-inter text-xs text-muted-foreground">Level {level}</p>
          </div>
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              className="bg-transparent font-inter text-sm text-foreground placeholder:text-muted-foreground flex-1 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="font-orbitron text-sm py-2 rounded-lg bg-primary hover:bg-primary/90 text-white tracking-wider disabled:opacity-50 transition-colors"
          >
            {submitting ? "SAVING..." : "SUBMIT SCORE"}
          </button>
        </form>
      )}

      {tab === "submit" && submitted && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="font-orbitron text-sm text-accent">Score submitted!</p>
          <button onClick={() => setTab("board")} className="font-inter text-xs text-muted-foreground underline">View leaderboard</button>
        </div>
      )}

      {/* Leaderboard */}
      {tab === "board" && (
        <div className="w-full max-w-xs flex flex-col gap-1.5 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center mt-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scores.length === 0 ? (
            <p className="text-muted-foreground font-inter text-sm text-center mt-6">No scores yet. Be the first!</p>
          ) : (
            scores.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border"
                style={{ borderColor: i < 3 ? rankColor(i) + "44" : "#ffffff11", background: i < 3 ? rankColor(i) + "11" : "transparent" }}
              >
                <span className="font-orbitron text-xs w-5 text-center font-bold" style={{ color: rankColor(i) }}>{i + 1}</span>
                <span className="font-inter text-sm text-foreground flex-1 truncate">{s.player_name}</span>
                <span className="font-orbitron text-sm" style={{ color: "#a855f7" }}>{s.score.toLocaleString()}</span>
                <span className="font-inter text-xs text-muted-foreground">Lv{s.level}</span>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}