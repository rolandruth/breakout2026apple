import React, { useRef, useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GameCanvas from "../components/game/GameCanvas";
import GameHUD from "../components/game/GameHUD";
import GameOverlay from "../components/game/GameOverlay";
import PauseMenu from "../components/game/PauseMenu";
import AchievementBadge from "../components/game/AchievementBadge";
import BottomNav from "../components/game/BottomNav";
import LevelSelector from "../components/game/LevelSelector";
import LevelTransition from "../components/game/LevelTransition";
import { GameContext } from "../lib/GameContext";
import { GAME_STATES, createInitialState, createLevel, setDifficulty } from "../lib/gameLogic";
import { setMuted, startMusic, stopMusic, setMusicIntensity } from "../lib/soundEngine";
import { saveLocalScore } from "../components/game/LocalLeaderboard";
import { saveMaxLevel, getDifficultyHighScore, saveDifficultyHighScore } from "../lib/ballSkins";
import { Pause, Volume2, VolumeX } from "lucide-react";
import { Capacitor } from "@capacitor/core";

const NAV_HEIGHT = 64;
// In the iPhone/Android app there is no mouse or keyboard, so the controls hint is simpler.
const isNativeApp = Capacitor.isNativePlatform();

export default function Game() {
  const location = useLocation();
  const isGameTab = location.pathname === "/";

  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [activeEffects, setActiveEffects] = useState({});
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [ballSpeed, setBallSpeed] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [difficulty, setDifficultyState] = useState(() => {
    const saved = localStorage.getItem("breakout2026_difficulty") || "normal";
    setDifficulty(saved);
    return saved;
  });
  const [highScore, setHighScore] = useState(() =>
    getDifficultyHighScore(localStorage.getItem("breakout2026_difficulty") || "normal")
  );
  const [achievements, setAchievements] = useState([]);
  const achievedRef = useRef(new Set());
  const gameDataRef = useRef(null);
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Pause when navigating away from game tab
  useEffect(() => {
    if (!isGameTab && gameStateRef.current === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.PAUSED);
    }
  }, [isGameTab]);

  const handleDifficultyChange = useCallback((d) => {
    setDifficultyState(d);
    setDifficulty(d);
    localStorage.setItem("breakout2026_difficulty", d);
    setHighScore(getDifficultyHighScore(d));
  }, []);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === GAME_STATES.PLAYING) return GAME_STATES.PAUSED;
      if (prev === GAME_STATES.PAUSED)  return GAME_STATES.PLAYING;
      return prev;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setMuted(next);
      if (next) stopMusic();
      else if (gameStateRef.current === GAME_STATES.PLAYING) startMusic(0);
      return next;
    });
  }, []);

  const toggleMusicMute = useCallback(() => {
    setMusicMuted((prev) => {
      const next = !prev;
      if (next) stopMusic();
      else if (gameStateRef.current === GAME_STATES.PLAYING) startMusic(0);
      return next;
    });
  }, []);

  // Keyboard: ESC / P / F9
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        const s = gameStateRef.current;
        if (s === GAME_STATES.PLAYING || s === GAME_STATES.PAUSED) {
          setGameState((prev) =>
            prev === GAME_STATES.PLAYING ? GAME_STATES.PAUSED : GAME_STATES.PLAYING
          );
        }
      }
      if (e.key === "F9") {
        e.preventDefault();
        setShowLevelSelector((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initGame = useCallback((lvl = 1, currentScore = 0) => {
    stopMusic();
    const bricks = createLevel(lvl);
    gameDataRef.current = createInitialState(bricks);
    import("../lib/gameLogic").then(({ DIFFICULTY_SETTINGS, PADDLE_BASE_WIDTH }) => {
      const ds = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;
      if (gameDataRef.current) {
        gameDataRef.current.paddle.width = Math.round(PADDLE_BASE_WIDTH * ds.paddleWidthMult);
      }
    });
    setLevel(lvl);
    setScore(currentScore);
    setLives(3);
    setActiveEffects({});
    setCombo(0);
    setComboMultiplier(1);
    achievedRef.current = new Set();
    setAchievements([]);
    setGameState(GAME_STATES.READY);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setGameState(GAME_STATES.PLAYING);
    if (!musicMuted) startMusic(0);
  }, [musicMuted]);

  const handleTransitionDone = useCallback(() => {
    setShowLevelTransition(false);
    setGameState(GAME_STATES.READY);
  }, []);

  const unlockAchievement = useCallback((id) => {
    if (achievedRef.current.has(id)) return;
    achievedRef.current.add(id);
    setAchievements((prev) => [...prev, id]);
  }, []);

  const handleAchievement = useCallback((type, payload) => {
    switch (type) {
      case "brick_destroyed":
        unlockAchievement("FIRST_BREAK");
        if (payload?.isBoss) unlockAchievement("BOSS_SLAYER");
        break;
      case "combo": {
        const c = payload?.combo || 0;
        if (c >= 3) unlockAchievement("COMBO_3");
        if (c >= 5) unlockAchievement("COMBO_5");
        break;
      }
      case "level":
        if (payload?.level >= 5)  unlockAchievement("LEVEL_5");
        if (payload?.level >= 10) unlockAchievement("LEVEL_10");
        break;
      case "score":
        if (payload?.score >= 1000)  unlockAchievement("SCORE_1K");
        if (payload?.score >= 5000)  unlockAchievement("SCORE_5K");
        if (payload?.score >= 10000) unlockAchievement("SCORE_10K");
        break;
      case "powerup":
        if (payload?.type === "EXTRA_LIFE") unlockAchievement("EXTRA_LIFE");
        if (payload?.type === "FIREBALL")   unlockAchievement("FIREBALL");
        if (payload?.type === "MULTI_BALL") unlockAchievement("MULTI_BALL");
        if (payload?.type === "MAGNET")     unlockAchievement("MAGNET");
        break;
      case "level_complete_low_lives":
        unlockAchievement("SURVIVE_3");
        break;
      default: break;
    }
  }, [unlockAchievement]);

  const handleScoreUpdate = useCallback((points) => {
    setScore((prev) => {
      const next = prev + points;
      handleAchievement("score", { score: next });
      setMusicIntensity(Math.min(1, next / 3000));
      return next;
    });
  }, [handleAchievement]);

  const handleExtraLife = useCallback(() => {
    setLives((prev) => Math.min(prev + 1, 5));
  }, []);

  const handleLifeLost = useCallback(() => {
    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        stopMusic();
        setGameState(GAME_STATES.GAME_OVER);
        setScore((currentScore) => {
          setHighScore((hs) => {
            const newHigh = Math.max(hs, currentScore);
            saveDifficultyHighScore(difficulty, newHigh);
            return newHigh;
          });
          setLevel((lvl) => { saveLocalScore(currentScore, lvl); return lvl; });
          return currentScore;
        });
      } else {
        if (gameDataRef.current) {
          gameDataRef.current.balls = [{
            x: gameDataRef.current.paddle.x + gameDataRef.current.paddle.width / 2,
            y: gameDataRef.current.paddle.y - 9,
            dx: 0, dy: 0, radius: 7, attached: true, fireball: false,
          }];
          gameDataRef.current.powerups = [];
          gameDataRef.current.lasers = [];
          gameDataRef.current.activeEffects = {};
          setActiveEffects({});
        }
        setCombo(0);
        setComboMultiplier(1);
        setBallSpeed(0);
        setGameState(GAME_STATES.READY);
      }
      return newLives;
    });
  }, [difficulty]);

  const handleLevelComplete = useCallback(() => {
    setLevel((prevLevel) => {
      const nextLevel = prevLevel + 1;
      saveMaxLevel(nextLevel);
      handleAchievement("level", { level: nextLevel });
      setScore((currentScore) => {
        const bonus = nextLevel * 50;
        setShowLevelTransition(true);
        setGameState(GAME_STATES.PAUSED);
        setTimeout(() => {
          const bricks = createLevel(nextLevel);
          gameDataRef.current = createInitialState(bricks);
          import("../lib/gameLogic").then(({ DIFFICULTY_SETTINGS, PADDLE_BASE_WIDTH }) => {
            const ds = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;
            if (gameDataRef.current) {
              gameDataRef.current.paddle.width = Math.round(PADDLE_BASE_WIDTH * ds.paddleWidthMult);
            }
          });
          setActiveEffects({});
          setLives((l) => { if (l === 1) handleAchievement("level_complete_low_lives", {}); return l; });
        }, 50);
        return currentScore + bonus;
      });
      return nextLevel;
    });
  }, [handleAchievement, difficulty]);

  const handleEffectsChange = useCallback((effects) => {
    setActiveEffects(effects);
    if (gameDataRef.current) {
      const moving = gameDataRef.current.balls?.find((b) => !b.attached);
      if (moving) {
        setBallSpeed(Math.sqrt(moving.dx * moving.dx + moving.dy * moving.dy));
      } else {
        setBallSpeed(0);
      }
    }
  }, []);

  const handleComboChange = useCallback((c, mult) => {
    setCombo(c);
    setComboMultiplier(mult);
  }, []);

  const isPlaying = gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED;

  // Context value shared with child route panels
  const gameContextValue = {
    muted,
    onToggleMute: toggleMute,
    difficulty,
    onDifficultyChange: handleDifficultyChange,
    onRestart: () => initGame(1, 0),
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="fixed inset-0 bg-background flex flex-col select-none overflow-hidden">
        {/* Ambient blobs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* ── Game canvas (always mounted, hidden on child routes) ──── */}
        <div
          className="relative z-10 flex flex-col items-center w-full flex-1 overflow-hidden"
          style={{
            display: isGameTab ? "flex" : "none",
            paddingTop: "var(--safe-top)",
            paddingBottom: NAV_HEIGHT,
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between w-full max-w-[540px] px-4 py-2">
            <h1 className="font-orbitron text-xl md:text-2xl font-bold tracking-wider bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              BREAKOUT 2026
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {isPlaying && (
                <button
                  onClick={togglePause}
                  className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-full max-w-[540px] px-4 flex-1 overflow-hidden">
            <GameHUD
              score={score}
              lives={lives}
              level={level}
              highScore={highScore}
              activeEffects={activeEffects}
              combo={combo}
              comboMultiplier={comboMultiplier}
              ballSpeed={ballSpeed}
              difficulty={difficulty}
            />

            <GameCanvas
              gameState={gameState}
              gameDataRef={gameDataRef}
              onScoreUpdate={handleScoreUpdate}
              onLifeLost={handleLifeLost}
              onLevelComplete={handleLevelComplete}
              onExtraLife={handleExtraLife}
              onEffectsChange={handleEffectsChange}
              onComboChange={handleComboChange}
              onAchievement={handleAchievement}
              onStart={startGame}
              level={level}
            >
              <AchievementBadge achievements={achievements} />
              <GameOverlay
                gameState={gameState}
                score={score}
                highScore={highScore}
                level={level}
                onStart={() => initGame(1, 0)}
                muted={muted}
                onToggleMute={toggleMute}
                musicMuted={musicMuted}
                onToggleMusicMute={toggleMusicMute}
              />
              <PauseMenu
                gameState={gameState}
                onResume={togglePause}
                onRestart={() => initGame(1, 0)}
                muted={muted}
                onToggleMute={toggleMute}
                onSettings={togglePause}
              />
              <LevelTransition
                level={level}
                visible={showLevelTransition}
                onDone={handleTransitionDone}
              />
              <LevelSelector
                visible={showLevelSelector}
                onClose={() => setShowLevelSelector(false)}
                onSelectLevel={(lvl) => {
                  setShowLevelSelector(false);
                  initGame(lvl, score);
                }}
              />
            </GameCanvas>

            <p className="text-muted-foreground text-[11px] font-inter tracking-wide text-center pb-1">
              {isNativeApp
                ? "Slide to move • Tap to launch"
                : "Mouse / touch / ← → to move • Tap or Space to launch • ESC to pause"}
            </p>
          </div>
        </div>

        {/* ── Child route panels (Skins / Scores / Settings) ─────────── */}
        {!isGameTab && (
          <div
            className="relative z-10 flex flex-col flex-1 overflow-hidden"
            style={{
              paddingTop: "var(--safe-top)",
              paddingBottom: NAV_HEIGHT,
            }}
          >
            <Outlet />
          </div>
        )}

        {/* ── Bottom Navigation ───────────────────────────────────────── */}
        <BottomNav />
      </div>
    </GameContext.Provider>
  );
}