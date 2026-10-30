import React, { useRef, useState, useEffect } from "react";
import { Share2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function drawScoreCard(canvas, score, level, highScore) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d0f1a");
  bg.addColorStop(1, "#1a0d2e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Glow orbs
  const drawOrb = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color + "55");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  drawOrb(60, 60, 100, "#a855f7");
  drawOrb(W - 60, H - 60, 120, "#22d3ee");

  // Border
  ctx.strokeStyle = "#a855f755";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Title
  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 18px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.fillText("BREAKOUT 2026", W / 2, 55);

  // Score
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 20;
  ctx.fillText(score.toLocaleString(), W / 2, 145);
  ctx.shadowBlur = 0;

  // Sub info
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px 'Orbitron', monospace";
  ctx.fillText(`LEVEL ${level}  •  BEST ${highScore.toLocaleString()}`, W / 2, 175);

  // Badge
  ctx.fillStyle = "#22d3ee22";
  ctx.strokeStyle = "#22d3ee55";
  ctx.lineWidth = 1;
  const bx = W / 2 - 70, by = 195, bw = 140, bh = 28;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#22d3ee";
  ctx.font = "11px 'Orbitron', monospace";
  ctx.fillText("CAN YOU BEAT THIS?", W / 2, 213);
}

export default function ShareScore({ score, level, highScore, onClose }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load Orbitron font then draw
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Give font a moment to load
    setTimeout(() => {
      if (canvasRef.current) {
        drawScoreCard(canvasRef.current, score, level, highScore);
        setReady(true);
      }
    }, 400);
  }, [score, level, highScore]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "breakout2026-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (navigator.share && blob) {
        try {
          const file = new File([blob], "breakout2026-score.png", { type: "image/png" });
          await navigator.share({ title: "Breakout 2026", text: `I scored ${score.toLocaleString()} on Level ${level}!`, files: [file] });
        } catch {
          handleDownload();
        }
      } else {
        handleDownload();
      }
    }, "image/png");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-xl z-30 flex flex-col items-center justify-center p-6 gap-4"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>

      <h2 className="font-orbitron text-xl font-bold tracking-wider text-foreground">SHARE SCORE</h2>

      <canvas
        ref={canvasRef}
        width={340}
        height={240}
        className="rounded-xl border border-border/40 w-full max-w-[300px]"
        style={{ background: "#0d0f1a" }}
      />

      {ready && (
        <div className="flex gap-3">
          <Button onClick={handleShare} className="font-orbitron text-xs gap-2 bg-primary hover:bg-primary/90">
            <Share2 className="w-3 h-3" /> SHARE
          </Button>
          <Button onClick={handleDownload} variant="outline" className="font-orbitron text-xs gap-2">
            <Download className="w-3 h-3" /> SAVE
          </Button>
        </div>
      )}
    </motion.div>
  );
}