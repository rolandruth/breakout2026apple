import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, Music, Music2, BookOpen, Layers, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRICK_TYPES = [
  { color: "#f43f5e", label: "1-Hit Brick", desc: "Destroyed in one hit. Most common brick type." },
  { color: "#6366f1", label: "2-Hit Brick", desc: "Takes two hits to destroy. Shows remaining hits." },
  { color: "#94a3b8", label: "3-Hit Brick", desc: "Takes three hits. Tougher — plan your shots." },
  { color: "#334155", label: "Indestructible", desc: "Cannot be destroyed. Ball bounces off it.", border: "#475569" },
  { color: "#ff0055", label: "Boss Brick", desc: "Appears every 10 levels. Many hits to defeat!", glow: true },
  { color: "#ff6600", label: "Explosive Brick", desc: "Destroys nearby bricks in a chain reaction!" },
];

const POWERUPS = [
  { color: "#22c55e", label: "W — Wide Paddle", desc: "Expands your paddle for easier catches." },
  { color: "#f43f5e", label: "♥ — Extra Life", desc: "Grants one additional life." },
  { color: "#a855f7", label: "M — Multi Ball", desc: "Splits into 3 balls simultaneously." },
  { color: "#06b6d4", label: "S — Slow Ball", desc: "Slows the ball down for more control." },
  { color: "#f97316", label: "F — Fast Ball", desc: "Speeds the ball up for more power." },
  { color: "#eab308", label: "L — Laser", desc: "Shoot lasers from your paddle." },
  { color: "#ec4899", label: "C — Catch", desc: "Ball sticks to paddle on contact." },
  { color: "#38bdf8", label: "🛡 — Shield", desc: "Bounces ball off the bottom once." },
  { color: "#f0abfc", label: "🧲 — Magnet", desc: "Attracts falling power-ups toward paddle." },
  { color: "#67e8f9", label: "⏱ — Time Warp", desc: "Slows everything to 25% speed." },
  { color: "#c4b5fd", label: "👻 — Ghost Ball", desc: "Ball passes through destructible bricks." },
  { color: "#f97316", label: "🔥 — Fireball", desc: "Ball burns through multiple bricks at once." },
  { color: "#94a3b8", label: "↔ — Shrink", desc: "Shrinks your paddle — avoid this one!" },
];

function HowToPlay({ onBack }) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      className="absolute inset-0 flex flex-col p-5 overflow-y-auto"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-inter mb-4 self-start transition-colors">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h3 className="font-orbitron text-lg font-bold text-primary mb-4">HOW TO PLAY</h3>
      <div className="space-y-3 text-sm font-inter text-muted-foreground">
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
          <p className="text-foreground font-semibold text-xs uppercase tracking-wider mb-2">Controls</p>
          <p>🖱️ <span className="text-foreground">Mouse</span> — move paddle left/right</p>
          <p>👆 <span className="text-foreground">Touch/Swipe</span> — drag to move paddle</p>
          <p>⬅️➡️ <span className="text-foreground">Arrow Keys</span> — move paddle</p>
          <p>🖱️ <span className="text-foreground">Click / Space</span> — launch ball or fire laser</p>
          <p>⎋ / P <span className="text-foreground">Escape or P</span> — pause game</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
          <p className="text-foreground font-semibold text-xs uppercase tracking-wider mb-2">Objective</p>
          <p>Break all destructible bricks to advance to the next level. Every 10th level is a <span className="text-destructive font-semibold">boss level</span>.</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
          <p className="text-foreground font-semibold text-xs uppercase tracking-wider mb-2">Scoring</p>
          <p>Each brick = <span className="text-foreground">10 pts</span>. Build combos for multipliers up to <span className="text-yellow-400 font-bold">5×</span>!</p>
          <p>Level completion bonus = <span className="text-foreground">level × 50 pts</span>.</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
          <p className="text-foreground font-semibold text-xs uppercase tracking-wider mb-2">Lives</p>
          <p>You start with <span className="text-foreground">3 lives</span>. Losing all lives ends the game. Earn extras with the ♥ power-up.</p>
        </div>
      </div>
    </motion.div>
  );
}

function BrickExplanation({ onBack }) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      className="absolute inset-0 flex flex-col p-5 overflow-y-auto"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-inter mb-4 self-start transition-colors">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h3 className="font-orbitron text-lg font-bold text-primary mb-4">BRICKS & POWER-UPS</h3>

      <p className="text-xs text-muted-foreground font-inter uppercase tracking-wider mb-2">Brick Types</p>
      <div className="space-y-2 mb-5">
        {BRICK_TYPES.map((b) => (
          <div key={b.label} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
            <div
              className="w-8 h-5 rounded flex-shrink-0"
              style={{
                background: b.color,
                boxShadow: b.glow ? `0 0 10px ${b.color}` : undefined,
                border: b.border ? `1px solid ${b.border}` : undefined,
              }}
            />
            <div>
              <p className="text-xs font-semibold text-foreground font-inter">{b.label}</p>
              <p className="text-xs text-muted-foreground font-inter">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-inter uppercase tracking-wider mb-2">Power-ups</p>
      <div className="space-y-2">
        {POWERUPS.map((p) => (
          <div key={p.label} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
            <div
              className="w-8 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: p.color }}
            >
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground font-inter">{p.label}</p>
              <p className="text-xs text-muted-foreground font-inter">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function MainMenu({ onPlay, muted, onToggleMute, musicMuted, onToggleMusicMute, highScore, onShowLeaderboard }) {
  const [screen, setScreen] = useState("main"); // main | howto | bricks

  return (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-md rounded-xl z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8"
          >
            {/* Title */}
            <div className="text-center">
              <h1 className="font-orbitron text-4xl md:text-5xl font-black bg-gradient-to-b from-white via-primary to-accent bg-clip-text text-transparent tracking-wider drop-shadow-lg">
                BREAKOUT
              </h1>
              <h2 className="font-orbitron text-xl font-bold text-accent/80 tracking-[0.3em] mt-0.5">2026</h2>
              <p className="text-muted-foreground font-inter text-xs mt-2 tracking-wide">
                Break all bricks • Build combos • Beat the boss
              </p>
            </div>

            {/* Play button */}
            <Button
              onClick={onPlay}
              size="lg"
              className="font-orbitron tracking-widest text-base gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 px-12 py-5"
            >
              <Play className="w-5 h-5" />
              PLAY
            </Button>

            {/* Sound toggles */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-inter transition-all ${
                  muted
                    ? "border-border text-muted-foreground bg-muted/30"
                    : "border-accent/40 text-accent bg-accent/10"
                }`}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {muted ? "SFX Off" : "SFX On"}
              </button>
              <button
                onClick={onToggleMusicMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-inter transition-all ${
                  musicMuted
                    ? "border-border text-muted-foreground bg-muted/30"
                    : "border-primary/40 text-primary bg-primary/10"
                }`}
              >
                {musicMuted ? <Music2 className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                {musicMuted ? "Music Off" : "Music On"}
              </button>
            </div>

            {/* Info buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("howto")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-inter transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                How to Play
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => setScreen("bricks")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-inter transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Bricks & Power-ups
              </button>
            </div>

            {/* Leaderboard */}
            <div className="flex items-center gap-3 text-xs font-inter border-t border-border/30 pt-3 w-full justify-center">
              <span className="text-muted-foreground/50">Best: {highScore.toLocaleString()}</span>
              <button onClick={onShowLeaderboard} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors">
                <Trophy className="w-3 h-3" /> Leaderboard
              </button>
            </div>
          </motion.div>
        )}

        {screen === "howto" && (
          <HowToPlay key="howto" onBack={() => setScreen("main")} />
        )}

        {screen === "bricks" && (
          <BrickExplanation key="bricks" onBack={() => setScreen("main")} />
        )}
      </AnimatePresence>
    </div>
  );
}