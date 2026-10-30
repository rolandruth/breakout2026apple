import React, { useState } from "react";
import { GAME_STATES } from "../../lib/gameLogic";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Share2 } from "lucide-react"; // Trophy kept for leaderboard button
import { motion, AnimatePresence } from "framer-motion";
import LocalLeaderboard from "./LocalLeaderboard";
import ShareScore from "./ShareScore";
import MainMenu from "./MainMenu";

export default function GameOverlay({
  gameState, score, highScore, level, onStart,
  muted, onToggleMute, musicMuted, onToggleMusicMute,
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const showOverlay = gameState === GAME_STATES.MENU || gameState === GAME_STATES.GAME_OVER;

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-xl z-10"
        >
          {/* Sub-screens (leaderboards/share) rendered on top of everything */}
          <AnimatePresence>
            {showLeaderboard && (
              <LocalLeaderboard onClose={() => setShowLeaderboard(false)} />
            )}
            {showShare && (
              <ShareScore
                score={score}
                level={level}
                highScore={highScore}
                onClose={() => setShowShare(false)}
              />
            )}
          </AnimatePresence>

          {/* Main Menu */}
          {!showLeaderboard && !showShare && gameState === GAME_STATES.MENU && (
            <MainMenu
              onPlay={onStart}
              muted={muted}
              onToggleMute={onToggleMute}
              musicMuted={musicMuted}
              onToggleMusicMute={onToggleMusicMute}
              highScore={highScore}
              onShowLeaderboard={() => setShowLeaderboard(true)}
            />
          )}

          {/* Game Over */}
          {!showLeaderboard && !showShare && gameState === GAME_STATES.GAME_OVER && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-xl gap-5 px-8"
            >
              <div className="text-center">
                <h2 className="font-orbitron text-3xl font-bold text-destructive">GAME OVER</h2>
                <div className="mt-3 space-y-1">
                  <p className="font-orbitron text-2xl text-foreground">{score.toLocaleString()}</p>
                  <p className="text-muted-foreground text-sm font-inter">
                    Level {level} • Best: {highScore.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={onStart}
                  size="sm"
                  className="font-orbitron tracking-wider text-xs gap-2 bg-primary hover:bg-primary/90 px-6"
                >
                  <RotateCcw className="w-3 h-3" />
                  TRY AGAIN
                </Button>
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors text-xs font-inter"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors text-xs font-inter"
                >
                  <Trophy className="w-3 h-3" />
                  Leaderboard
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}