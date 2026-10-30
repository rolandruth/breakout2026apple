import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGameContext } from "../../lib/GameContext";
import SettingsMenu from "./SettingsMenu";

export default function SettingsPanel() {
  const navigate = useNavigate();
  const { muted, onToggleMute, difficulty, onDifficultyChange, onRestart } = useGameContext();

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
        <h2 className="font-orbitron text-lg font-bold tracking-widest text-foreground">SETTINGS</h2>
      </div>
      <SettingsMenu
        embedded
        muted={muted}
        onToggleMute={onToggleMute}
        onRestart={() => { onRestart(); navigate("/"); }}
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
      />
    </div>
  );
}