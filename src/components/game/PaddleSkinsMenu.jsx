import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { PADDLE_SKINS, getSelectedPaddleSkin, setSelectedPaddleSkin, isPaddleSkinUnlocked } from "../../lib/paddleSkins";

export default function PaddleSkinsMenu({ visible, onClose }) {
  const [selected, setSelected] = useState(getSelectedPaddleSkin());

  const handleSelect = (skin) => {
    if (!isPaddleSkinUnlocked(skin)) return;
    setSelectedPaddleSkin(skin.id);
    setSelected(skin.id);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/92 backdrop-blur-lg rounded-xl z-30 flex flex-col p-5 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-xl font-bold tracking-widest text-foreground">PADDLE SKINS</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PADDLE_SKINS.map((skin) => {
              const unlocked = isPaddleSkinUnlocked(skin);
              const isSelected = selected === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => handleSelect(skin)}
                  disabled={!unlocked}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                  style={{
                    borderColor: isSelected ? skin.color1 : unlocked ? "#ffffff22" : "#ffffff11",
                    background: isSelected ? skin.color1 + "22" : unlocked ? "#ffffff08" : "#ffffff05",
                    boxShadow: isSelected ? `0 0 16px ${skin.color1}55` : "none",
                    opacity: unlocked ? 1 : 0.5,
                  }}
                >
                  {/* Paddle preview */}
                  <div
                    className="w-20 h-4 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${skin.color1}, ${skin.color2}, ${skin.color1})`,
                      boxShadow: isSelected ? `0 0 12px ${skin.color1}88` : `0 0 6px ${skin.color1}44`,
                    }}
                  />
                  <span className="font-orbitron text-xs font-bold" style={{ color: unlocked ? skin.color1 : "#64748b" }}>
                    {skin.name}
                  </span>
                  <span className="font-inter text-[10px] text-muted-foreground text-center leading-tight">
                    {unlocked ? skin.desc : skin.lockDesc}
                  </span>
                  {!unlocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                  )}
                  {isSelected && unlocked && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}