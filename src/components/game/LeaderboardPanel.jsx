import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, RefreshCw, ArrowLeft } from "lucide-react";
import { getLocalScores } from "./LocalLeaderboard";

const PULL_THRESHOLD = 60; // px

const rankStyle = (i) => {
  if (i === 0) return "#fbbf24";
  if (i === 1) return "#94a3b8";
  if (i === 2) return "#f97316";
  return "#6b7280";
};

export default function LeaderboardPanel() {
  const navigate = useNavigate();
  const [scores, setScores] = useState(getLocalScores);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = React.useRef(null);
  const scrollRef = React.useRef(null);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setScores(getLocalScores());
      setRefreshing(false);
    }, 600);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullY(Math.min(delta, PULL_THRESHOLD * 1.5));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (pullY >= PULL_THRESHOLD) refresh();
    setPullY(0);
    touchStartY.current = null;
  }, [pullY, refresh]);

  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Back header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-orbitron text-lg font-bold tracking-widest text-foreground">SCORES</h2>
      </div>

      {/* Scrollable body with pull-to-refresh */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        <div
          className="flex items-center justify-center transition-all overflow-hidden"
          style={{ height: pullY > 0 || refreshing ? (refreshing ? 48 : pullY) : 0 }}
        >
          <RefreshCw
            className="w-5 h-5 text-primary transition-transform"
            style={{
              opacity: refreshing ? 1 : pullProgress,
              transform: refreshing
                ? "rotate(360deg)"
                : `rotate(${pullProgress * 180}deg)`,
              animation: refreshing ? "spin 0.8s linear infinite" : "none",
            }}
          />
        </div>

        <div className="px-4 py-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-orbitron text-xl font-bold tracking-wider text-foreground">LOCAL BEST</h2>
          </div>

          <p className="text-muted-foreground font-inter text-xs mb-4 opacity-60">
            Pull down to refresh
          </p>

          {scores.length === 0 ? (
            <div className="flex flex-col items-center gap-3 mt-8">
              <Trophy className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-inter text-sm">No scores yet — play a game!</p>
            </div>
          ) : (
            <div className="w-full max-w-xs flex flex-col gap-2 pb-4">
              {scores.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 rounded-xl border"
                  style={{
                    minHeight: 52,
                    borderColor: i < 3 ? rankStyle(i) + "44" : "#ffffff11",
                    background: i < 3 ? rankStyle(i) + "11" : "transparent",
                  }}
                >
                  <Medal className="w-4 h-4 shrink-0" style={{ color: rankStyle(i) }} />
                  <span className="font-orbitron text-sm font-bold flex-1" style={{ color: rankStyle(i) }}>
                    {entry.score.toLocaleString()}
                  </span>
                  <span className="font-inter text-xs text-muted-foreground">Lv {entry.level}</span>
                  <span className="font-inter text-xs text-muted-foreground/50">{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}