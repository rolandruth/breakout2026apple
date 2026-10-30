import React from "react";
import { Heart, Trophy, Layers, Zap } from "lucide-react";
import { POWERUP_TYPES, isBossLevel } from "../../lib/gameLogic";

export default function GameHUD({ score, lives, level, highScore, activeEffects, combo, comboMultiplier, ballSpeed, difficulty }) {
  const now = Date.now();

  const activeList = Object.entries(activeEffects || {})
    .filter(([, exp]) => exp && exp > now)
    .map(([key]) => key);

  // Speed bar: 0-1 normalized (base speed ~5, max ~8.5)
  const speedRatio = ballSpeed ? Math.min(1, ballSpeed / 8.5) : 0;
  const speedColor = speedRatio < 0.4 ? "#22d3ee" : speedRatio < 0.7 ? "#eab308" : "#f97316";

  return (
    <div className="flex flex-col gap-2 w-full max-w-[540px]">
      <div className="flex items-center justify-between px-1 gap-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-chart-4" />
          <span className="font-orbitron text-xs text-muted-foreground tracking-wide">HI</span>
          <span className="font-orbitron text-sm text-foreground/80 tabular-nums">{highScore.toLocaleString()}</span>
          {difficulty && difficulty !== "normal" && (
            <span className="font-orbitron text-[9px] px-1 py-0.5 rounded uppercase tracking-wider"
              style={{
                color: difficulty === "easy" ? "#22c55e" : difficulty === "hard" ? "#f97316" : "#ef4444",
                background: difficulty === "easy" ? "#22c55e22" : difficulty === "hard" ? "#f9731622" : "#ef444422",
              }}>
              {difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-orbitron text-lg font-bold tabular-nums text-foreground">{score.toLocaleString()}</span>
          {combo >= 2 && (
            <span
              className="font-orbitron text-xs font-bold px-1.5 py-0.5 rounded-md animate-pulse"
              style={{ background: "#ff440022", color: "#ff6644", border: "1px solid #ff444455" }}
            >
              ×{comboMultiplier} COMBO {combo}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-orbitron text-sm text-foreground/80">{level}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all duration-300 ${
                  i < lives ? "text-destructive fill-destructive" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Boss level indicator */}
      {isBossLevel(level) && (
        <div className="flex justify-center">
          <span className="font-orbitron text-xs font-bold px-3 py-1 rounded-full animate-pulse"
            style={{ background: "#ff005522", color: "#ff0055", border: "1px solid #ff005555" }}>
            ⚠ BOSS LEVEL
          </span>
        </div>
      )}

      {/* Active power-up badges — always rendered to prevent layout shift */}
      <div className="flex items-center gap-1.5 px-1 flex-wrap h-[24px]">
          {activeList.map((key) => {
            const info = POWERUP_TYPES[key];
            if (!info) return null;
            const remaining = Math.max(0, Math.ceil((activeEffects[key] - now) / 1000));
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-orbitron border"
                style={{
                  color: info.color,
                  borderColor: info.color + "55",
                  backgroundColor: info.color + "18",
                  boxShadow: `0 0 8px ${info.color}33`,
                }}
              >
                <span>{info.label}</span>
                <span className="opacity-70">{info.desc}</span>
                {info.duration > 0 && <span className="opacity-50">{remaining}s</span>}
              </div>
            );
          })}
      </div>
    </div>
  );
}