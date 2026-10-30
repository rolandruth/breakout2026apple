import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react";
import { GAME_STATES } from "../../lib/gameLogic";

export default function PauseMenu({ gameState, onResume, onRestart, muted, onToggleMute, onSettings }) {
  const visible = gameState === GAME_STATES.PAUSED;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 backdrop-blur-lg rounded-xl z-20"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6 px-10"
          >
            <div className="text-center">
              <h2 className="font-orbitron text-3xl font-bold text-foreground tracking-widest">
                PAUSED
              </h2>
              <p className="text-muted-foreground text-xs font-inter mt-1 tracking-wide">
                Press ESC or P to resume
              </p>
            </div>

            <div className="flex flex-col gap-3 w-48">
              <Button
                onClick={onResume}
                size="lg"
                className="font-orbitron tracking-wider text-sm gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 w-full"
              >
                <Play className="w-4 h-4" />
                RESUME
              </Button>

              <Button
                onClick={onToggleMute}
                size="lg"
                variant="outline"
                className="font-orbitron tracking-wider text-sm gap-2 w-full"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {muted ? "UNMUTE" : "MUTE"}
              </Button>

              <Button
                onClick={onSettings}
                size="lg"
                variant="outline"
                className="font-orbitron tracking-wider text-sm gap-2 w-full"
              >
                <Settings className="w-4 h-4" />
                SETTINGS
              </Button>

              <Button
                onClick={onRestart}
                size="lg"
                variant="ghost"
                className="font-orbitron tracking-wider text-sm gap-2 w-full text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                RESTART
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}