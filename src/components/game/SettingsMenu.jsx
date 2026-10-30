import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, RotateCcw, Trash2, Gauge, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const STORAGE_KEY = "breakout2026_local_scores";

const DIFFICULTIES = [
  { id: "easy",   label: "EASY",   desc: "Slower ball, wider paddle", color: "#22c55e" },
  { id: "normal", label: "NORMAL", desc: "Classic experience",         color: "#a855f7" },
  { id: "hard",   label: "HARD",   desc: "Faster ball, more bricks",  color: "#f97316" },
  { id: "insane", label: "INSANE", desc: "Maximum chaos",              color: "#ef4444" },
];

export { DIFFICULTIES };

function SettingsContent({ muted, onToggleMute, onRestart, difficulty, onDifficultyChange }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated } = useAuth();

  const clearScores = () => localStorage.removeItem(STORAGE_KEY);

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await base44.auth.deleteAccount();
      window.location.href = "/";
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-xs mx-auto px-4 py-5">
      {/* Difficulty */}
      <div className="flex flex-col gap-2">
        <label className="font-orbitron text-xs text-muted-foreground tracking-widest uppercase flex items-center gap-1">
          <Gauge className="w-3 h-3" /> Difficulty
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => onDifficultyChange(d.id)}
              className="flex flex-col items-start px-3 py-2.5 rounded-lg border transition-all text-left"
              style={{
                minHeight: 56,
                borderColor: difficulty === d.id ? d.color : "#ffffff22",
                background: difficulty === d.id ? d.color + "22" : "transparent",
                boxShadow: difficulty === d.id ? `0 0 12px ${d.color}44` : "none",
              }}
            >
              <span className="font-orbitron text-xs font-bold" style={{ color: d.color }}>{d.label}</span>
              <span className="font-inter text-[11px] text-muted-foreground leading-tight mt-0.5">{d.desc}</span>
            </button>
          ))}
        </div>
        <p className="font-inter text-[11px] text-muted-foreground/60 text-center">Takes effect on next game</p>
      </div>

      {/* Audio */}
      <div className="flex flex-col gap-2">
        <label className="font-orbitron text-xs text-muted-foreground tracking-widest uppercase">Audio</label>
        <Button
          onClick={onToggleMute}
          variant="outline"
          className="font-orbitron tracking-wider text-sm gap-2 w-full justify-start"
          style={{ minHeight: 48 }}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted ? "Sound: OFF" : "Sound: ON"}
        </Button>
      </div>

      {/* Game */}
      <div className="flex flex-col gap-2">
        <label className="font-orbitron text-xs text-muted-foreground tracking-widest uppercase">Game</label>
        <Button
          onClick={onRestart}
          variant="outline"
          className="font-orbitron tracking-wider text-sm gap-2 w-full justify-start"
          style={{ minHeight: 48 }}
        >
          <RotateCcw className="w-4 h-4" /> Restart Game
        </Button>
        <Button
          onClick={clearScores}
          variant="ghost"
          className="font-orbitron tracking-wider text-xs gap-2 w-full justify-start text-destructive hover:text-destructive"
          style={{ minHeight: 44 }}
        >
          <Trash2 className="w-4 h-4" /> Clear Local Scores
        </Button>
      </div>

      {/* Account */}
      {/* Only signed-in players have an account to delete */}
      {isAuthenticated && (
      <div className="flex flex-col gap-2">
        <label className="font-orbitron text-xs text-muted-foreground tracking-widest uppercase">Account</label>
        <Button
          onClick={handleDeleteAccount}
          disabled={deleting}
          variant="ghost"
          className="font-orbitron tracking-wider text-xs gap-2 w-full justify-start text-destructive hover:text-destructive"
          style={{ minHeight: 44 }}
        >
          <LogOut className="w-4 h-4" />
          {deleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete Account"}
        </Button>
        {confirmDelete && !deleting && (
          <p className="font-inter text-[11px] text-destructive/70 text-center">
            This is permanent and cannot be undone.
          </p>
        )}
      </div>
      )}
    </div>
  );
}

// embedded=true → renders inline (for bottom nav tab)
// embedded=false/undefined → renders as floating overlay (legacy, kept for PauseMenu)
export default function SettingsMenu({ visible, onClose, muted, onToggleMute, onRestart, difficulty, onDifficultyChange, embedded }) {
  if (embedded) {
    return (
      <SettingsContent
        muted={muted}
        onToggleMute={onToggleMute}
        onRestart={onRestart}
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
      />
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/90 backdrop-blur-lg rounded-xl z-30 flex flex-col items-center justify-start overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
          <div className="pt-12 w-full">
            <SettingsContent
              muted={muted}
              onToggleMute={onToggleMute}
              onRestart={onRestart}
              difficulty={difficulty}
              onDifficultyChange={onDifficultyChange}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}