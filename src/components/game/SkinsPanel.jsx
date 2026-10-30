import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { BALL_SKINS, isSkinUnlocked, getSelectedSkin, setSelectedSkin } from "../../lib/ballSkins";
import { PADDLE_SKINS, getSelectedPaddleSkin, setSelectedPaddleSkin, isPaddleSkinUnlocked } from "../../lib/paddleSkins";

function SectionHeader({ children }) {
  return (
    <h3 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

export default function SkinsPanel() {
  const navigate = useNavigate();
  const [selectedBall, setSelectedBall] = useState(getSelectedSkin);
  const [selectedPaddle, setSelectedPaddle] = useState(getSelectedPaddleSkin);

  const handleBallSelect = (skin) => {
    if (!isSkinUnlocked(skin)) return;
    setSelectedSkin(skin.id);
    setSelectedBall(skin.id);
  };

  const handlePaddleSelect = (skin) => {
    if (!isPaddleSkinUnlocked(skin)) return;
    setSelectedPaddleSkin(skin.id);
    setSelectedPaddle(skin.id);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-orbitron text-lg font-bold tracking-widest text-foreground">SKINS</h2>
      </div>
      <div className="px-4 py-4">
      {/* ── Ball Skins ──────────────────────────────────────────────── */}
      <SectionHeader>Ball Skins</SectionHeader>
      <div className="grid grid-cols-2 gap-3">
        {BALL_SKINS.map((skin) => {
          const unlocked = isSkinUnlocked(skin);
          const isActive = selectedBall === skin.id;
          return (
            <button
              key={skin.id}
              onClick={() => handleBallSelect(skin)}
              disabled={!unlocked}
              className="relative flex flex-col items-center gap-2 rounded-xl border transition-all text-left"
              style={{
                minHeight: 80,
                padding: "12px 8px",
                borderColor: isActive ? "hsl(var(--primary))" : unlocked ? "hsl(var(--border))" : "hsl(var(--border) / 0.4)",
                background: isActive ? "hsl(var(--primary) / 0.12)" : unlocked ? "hsl(var(--card))" : "hsl(var(--card) / 0.5)",
                boxShadow: isActive ? "0 0 14px hsl(var(--primary) / 0.25)" : "none",
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <span className="text-3xl">{skin.emoji}</span>
              <span className="font-orbitron text-xs font-bold text-foreground">{skin.name}</span>
              {!unlocked ? (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span className="font-inter text-[11px] text-center leading-tight">{skin.desc}</span>
                </div>
              ) : isActive ? (
                <span className="font-orbitron text-[11px] text-primary font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="font-inter text-[11px] text-muted-foreground">Tap to equip</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Paddle Skins ────────────────────────────────────────────── */}
      <SectionHeader>Paddle Skins</SectionHeader>
      <div className="grid grid-cols-2 gap-3 pb-4">
        {PADDLE_SKINS.map((skin) => {
          const unlocked = isPaddleSkinUnlocked(skin);
          const isActive = selectedPaddle === skin.id;
          return (
            <button
              key={skin.id}
              onClick={() => handlePaddleSelect(skin)}
              disabled={!unlocked}
              className="relative flex flex-col items-center gap-2 rounded-xl border transition-all"
              style={{
                minHeight: 88,
                padding: "12px 8px",
                borderColor: isActive ? skin.color1 : unlocked ? "#ffffff22" : "#ffffff11",
                background: isActive ? skin.color1 + "22" : unlocked ? "#ffffff08" : "#ffffff05",
                boxShadow: isActive ? `0 0 16px ${skin.color1}55` : "none",
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <div
                className="w-20 h-4 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${skin.color1}, ${skin.color2}, ${skin.color1})`,
                  boxShadow: isActive ? `0 0 10px ${skin.color1}88` : `0 0 4px ${skin.color1}44`,
                }}
              />
              <span className="font-orbitron text-xs font-bold" style={{ color: unlocked ? skin.color1 : "#64748b" }}>
                {skin.name}
              </span>
              <span className="font-inter text-[11px] text-muted-foreground text-center leading-tight">
                {unlocked ? (isActive ? "✓ Equipped" : skin.desc) : skin.lockDesc}
              </span>
              {!unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-muted-foreground/50" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground font-inter pb-2">
        Earn points &amp; reach levels to unlock skins
      </p>
      </div>
    </div>
  );
}