import React, { useRef, useEffect } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../lib/gameLogic";

// Optimized for tablet — reduced particle counts, no per-particle shadowBlur
const THEMES = [
  {
    name: "space",
    bg: ["#020408", "#050d1a"],
    layers: [
      { count: 20, speed: 0.1, size: 1,   color: "#ffffff", type: "star" },
      { count: 8,  speed: 0.25, size: 1.5, color: "#aad4ff", type: "star" },
    ],
    accent: "#1a3a6e",
    nebula: true,
  },
  {
    name: "grid",
    bg: ["#020a0f", "#001a0f"],
    layers: [
      { count: 18, speed: 0.15, size: 1,   color: "#00ff88", type: "dot" },
      { count: 6,  speed: 0.3,  size: 1.5, color: "#00ffcc", type: "dot" },
    ],
    accent: "#003322",
    grid: true,
  },
  {
    name: "forest",
    bg: ["#030810", "#0a0520"],
    layers: [
      { count: 18, speed: 0.12, size: 1,   color: "#cc44ff", type: "orb" },
      { count: 6,  speed: 0.28, size: 2,   color: "#ff44cc", type: "orb" },
    ],
    accent: "#1a0033",
    forest: true,
  },
  {
    name: "city",
    bg: ["#04060f", "#0a0a18"],
    layers: [
      { count: 15, speed: 0.1,  size: 1,   color: "#ffaa00", type: "spark" },
      { count: 5,  speed: 0.3,  size: 1.5, color: "#ff6600", type: "spark" },
    ],
    accent: "#1a0a00",
    city: true,
  },
];

// Pre-generate stable particle positions per theme
function seedParticles(theme) {
  return theme.layers.map((layer) => {
    const pts = [];
    for (let i = 0; i < layer.count; i++) {
      pts.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
      });
    }
    return pts;
  });
}

export default function BackgroundCanvas({ paddleX, paddleWidth, level }) {
  const canvasRef = useRef(null);
  const paddleRef = useRef({ paddleX, paddleWidth });
  const stateRef = useRef({
    themeIdx: 0,
    nextThemeIdx: 1,
    blend: 0,
    blending: false,
    lastLevel: level,
    particles: THEMES.map(seedParticles),
    frame: 0,
  });

  // Update paddle ref without restarting the loop
  useEffect(() => {
    paddleRef.current = { paddleX, paddleWidth };
  }, [paddleX, paddleWidth]);

  // Trigger theme transition on level change
  useEffect(() => {
    const s = stateRef.current;
    if (level !== s.lastLevel) {
      s.lastLevel = level;
      s.nextThemeIdx = (s.themeIdx + 1) % THEMES.length;
      s.blend = 0;
      s.blending = true;
    }
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    // Pre-build cached background gradients (created once, not per frame)
    const bgGradients = THEMES.map((theme) => {
      const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      g.addColorStop(0, theme.bg[0]);
      g.addColorStop(1, theme.bg[1]);
      return g;
    });

    const drawTheme = (theme, themeIdx, particles, alpha, paddleOffsetX, frame) => {
      // Solid background (use cached gradient)
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bgGradients[themeIdx];
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Accent color as simple flat rect (no radial gradient per frame)
      ctx.globalAlpha = alpha * 0.12;
      ctx.fillStyle = theme.accent;
      ctx.fillRect(0, CANVAS_HEIGHT * 0.6, CANVAS_WIDTH, CANVAS_HEIGHT * 0.4);

      // Grid (only draw every 4th frame to save GPU)
      if (theme.grid && frame % 4 === 0) {
        ctx.globalAlpha = alpha * 0.06;
        ctx.strokeStyle = "#00ff44";
        ctx.lineWidth = 1;
        const gridSpacing = 40;
        ctx.beginPath();
        for (let x = 0; x < CANVAS_WIDTH; x += gridSpacing) {
          ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT);
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += gridSpacing) {
          ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y);
        }
        ctx.stroke();
      }

      // Forest: simplified tendrils (no per-tendril gradient)
      if (theme.forest) {
        ctx.globalAlpha = alpha * 0.15;
        ctx.strokeStyle = "#aa22ff";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const tx = (i / 4) * CANVAS_WIDTH;
          ctx.beginPath();
          ctx.moveTo(tx, CANVAS_HEIGHT);
          ctx.lineTo(tx + Math.sin(frame * 0.01 + i) * 10, CANVAS_HEIGHT * 0.35);
          ctx.stroke();
        }
      }

      // Particles — no shadowBlur at all, just alpha twinkle
      ctx.shadowBlur = 0;
      theme.layers.forEach((layer, li) => {
        const pts = particles[li];
        if (!pts) return;
        const offsetX = paddleOffsetX * layer.speed;
        ctx.fillStyle = layer.color;
        pts.forEach((p) => {
          const twinkle = 0.4 + 0.4 * Math.abs(Math.sin(p.twinkle + frame * p.twinkleSpeed));
          ctx.globalAlpha = alpha * twinkle * 0.85;
          const px = ((p.x + offsetX) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
          ctx.fillRect(px - layer.size, p.y - layer.size, layer.size * 2, layer.size * 2);
        });
      });

      ctx.globalAlpha = 1;
    };

    // Run background at ~30fps to save GPU on tablets
    let lastBgTime = 0;
    const BG_INTERVAL = 33; // ~30fps

    const loop = (timestamp) => {
      animId = requestAnimationFrame(loop);

      if (timestamp - lastBgTime < BG_INTERVAL) return;
      lastBgTime = timestamp;

      const s = stateRef.current;
      s.frame++;

      // Advance blend
      if (s.blending) {
        s.blend += 0.018;
        if (s.blend >= 1) {
          s.blend = 1;
          s.blending = false;
          s.themeIdx = s.nextThemeIdx;
          s.blend = 0;
        }
      }

      const { paddleX: px, paddleWidth: pw } = paddleRef.current;
      const paddleCenter = px + pw / 2;
      const paddleOffsetX = (paddleCenter - CANVAS_WIDTH / 2);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (s.blending) {
        drawTheme(THEMES[s.themeIdx], s.themeIdx, s.particles[s.themeIdx], 1 - s.blend, paddleOffsetX, s.frame);
        drawTheme(THEMES[s.nextThemeIdx], s.nextThemeIdx, s.particles[s.nextThemeIdx], s.blend, paddleOffsetX, s.frame);
      } else {
        drawTheme(THEMES[s.themeIdx], s.themeIdx, s.particles[s.themeIdx], 1, paddleOffsetX, s.frame);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []); // stable loop — paddle read from ref

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{ width: "100%", height: "100%", opacity: 0.9 }}
    />
  );
}