import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { BALL_SKINS, isSkinUnlocked, getSelectedSkin, setSelectedSkin } from "../../lib/ballSkins";

export default function BallSkinsMenu({ visible, onClose, onSelect }) {
  const [selected, setSelected] = React.useState(getSelectedSkin);

  if (!visible) return null;

  const handleSelect = (skin) => {
    if (!isSkinUnlocked(skin)) return;
    setSelected(skin.id);
    setSelectedSkin(skin.id);
    onSelect?.(skin.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-background/85 backdrop-blur-md rounded-xl"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          className="w-full max-w-xs mx-4 rounded-2xl border border-border bg-card p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-sm font-bold text-foreground tracking-widest">BALL SKINS</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BALL_SKINS.map((skin) => {
              const unlocked = isSkinUnlocked(skin);
              const isActive = selected === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => handleSelect(skin)}
                  disabled={!unlocked}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                      : unlocked
                      ? "border-border hover:border-primary/50 hover:bg-muted/50"
                      : "border-border/30 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-2xl">{skin.emoji}</span>
                  <span className="font-orbitron text-[10px] font-bold text-foreground">{skin.name}</span>
                  {!unlocked && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-inter">{skin.desc}</span>
                    </div>
                  )}
                  {unlocked && !isActive && (
                    <span className="text-[9px] font-inter text-muted-foreground">Unlocked</span>
                  )}
                  {isActive && (
                    <span className="text-[9px] font-orbitron text-primary font-bold">ACTIVE</span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-muted-foreground font-inter mt-4">
            Earn points &amp; reach levels to unlock skins
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}