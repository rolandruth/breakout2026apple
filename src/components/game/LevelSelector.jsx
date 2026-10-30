import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TOTAL_LEVELS = 202;

export default function LevelSelector({ visible, onClose, onSelectLevel }) {
  const [search, setSearch] = useState("");

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).filter(
    (l) => !search || l.toString().includes(search)
  );

  const handleSelect = (lvl) => {
    onSelectLevel(lvl);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-orbitron text-lg font-bold text-primary">LEVEL SELECT</h2>
              <p className="text-muted-foreground text-xs font-inter">🔒 Dev mode — F9</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="number"
            placeholder="Jump to level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-full"
            min={1}
            max={TOTAL_LEVELS}
          />

          <div className="overflow-y-auto flex-1 grid grid-cols-8 gap-1.5 content-start">
            {levels.map((lvl) => {
              const isBoss = lvl % 10 === 0;
              return (
                <button
                  key={lvl}
                  onClick={() => handleSelect(lvl)}
                  className={`aspect-square rounded-md text-xs font-orbitron font-bold transition-all hover:scale-110 active:scale-95 ${
                    isBoss
                      ? "bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/40"
                      : "bg-muted/60 text-foreground border border-border/50 hover:bg-primary/20 hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground/50 text-xs mt-2 font-inter">
            Red = boss level
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}