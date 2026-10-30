import React, { useRef, useEffect, useCallback, useState } from "react";
import BackgroundCanvas from "./BackgroundCanvas";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GAME_STATES,
  POWERUP_TYPES,
  updateGame,
  launchBall,
  fireLaser,
} from "../../lib/gameLogic";
import { getActiveSkin, getRainbowColor } from "../../lib/ballSkins";
import { getActivePaddleSkin } from "../../lib/paddleSkins";

// Per-brick animation state (hit flash + destroy scale)
const brickAnims = new Map(); // key: `${col}_${row}` → { flash: 0-1, destroy: 0-1, color }
function getBrickKey(brick) { return `${Math.round(brick.x)}_${Math.round(brick.y)}`; }
function triggerBrickHit(brick) {
  const k = getBrickKey(brick);
  const cur = brickAnims.get(k) || {};
  brickAnims.set(k, { ...cur, flash: 1 });
}
function triggerBrickDestroy(brick) {
  brickAnims.set(getBrickKey(brick), { flash: 0, destroy: 1, color: brick.color });
}
import {
  soundPaddleHit,
  soundWallHit,
  soundBrickHit,
  soundBrickDestroy,
  soundPowerupCatch,
  soundLaserFire,
  soundLifeLost,
  soundLevelComplete,
  soundComboVoice,
} from "../../lib/soundEngine";

export default function GameCanvas({
  gameState,
  gameDataRef,
  onScoreUpdate,
  onLifeLost,
  onLevelComplete,
  onExtraLife,
  onStart,
  onEffectsChange,
  onComboChange,
  onAchievement,
  level,
  children,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const [paddleState, setPaddleState] = useState({ x: 225, width: 90 });
  const shakeRef = useRef({ intensity: 0, decay: 0.85 });
  const flashRef = useRef({ alpha: 0, color: "#ffffff" }); // screen flash
  const vignetteRef = useRef({ alpha: 0, color: "#ff0000" }); // life-lost vignette
  const keysRef = useRef({ left: false, right: false });
  // Ball trail history: ballId → [{x,y,r,fireball}]
  const trailsRef = useRef(new Map());
  const TRAIL_LEN = 10;
  // Brick bounce animation: key → scale (1 → 1.15 → 1)
  const brickBounceRef = useRef(new Map());
  // Swipe tracking
  const swipeTouchRef = useRef(null);

  // ── Paddle move ───────────────────────────────────────────────────────────
  const movePaddle = useCallback(
    (clientX) => {
      const container = containerRef.current;
      if (!container || !gameDataRef.current) return;
      const rect = container.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const relX = (clientX - rect.left) * scaleX;
      const { paddle, balls } = gameDataRef.current;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, relX - paddle.width / 2));
      const attachedBall = balls?.find((b) => b.attached);
      if (attachedBall) attachedBall.x = paddle.x + paddle.width / 2;
      setPaddleState({ x: paddle.x, width: paddle.width });
    },
    [gameDataRef]
  );

  // ── Click / tap ───────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (gameState === GAME_STATES.READY) {
      onStart();
      if (gameDataRef.current) launchBall(gameDataRef.current);
    } else if (gameState === GAME_STATES.PLAYING && gameDataRef.current) {
      const attachedBall = gameDataRef.current.balls?.find((b) => b.attached);
      if (attachedBall) {
        launchBall(gameDataRef.current);
      } else {
        const fired = fireLaser(gameDataRef.current);
        if (fired) soundLaserFire();
      }
    }
  }, [gameState, onStart, gameDataRef]);

  // ── Keyboard controls ─────────────────────────────────────────────────────
  const gameStateRef = useRef(gameState);
  const onStartRef = useRef(onStart);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") { keysRef.current.left = true; e.preventDefault(); }
      if (e.key === "ArrowRight") { keysRef.current.right = true; e.preventDefault(); }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!gameDataRef.current) return;
        const state = gameStateRef.current;
        if (state === GAME_STATES.READY) {
          onStartRef.current();
          launchBall(gameDataRef.current);
        } else if (state === GAME_STATES.PLAYING) {
          const attachedBall = gameDataRef.current.balls?.find((b) => b.attached);
          if (attachedBall) {
            launchBall(gameDataRef.current);
          } else {
            const fired = fireLaser(gameDataRef.current);
            if (fired) soundLaserFire();
          }
        }
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [gameDataRef]);

  // ── Mouse / touch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMouseMove = (e) => movePaddle(e.clientX);

    // Swipe: track start position, then on move compute delta to shift paddle
    const onTouchStart = (e) => {
      swipeTouchRef.current = { x: e.touches[0].clientX, paddleX: gameDataRef.current?.paddle?.x ?? 0 };
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (!gameDataRef.current) return;
      const touch = e.touches[0];
      if (swipeTouchRef.current) {
        // Swipe-delta mode: move paddle by touch delta relative to canvas scale
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const delta = (touch.clientX - swipeTouchRef.current.x) * scaleX;
        const { paddle, balls } = gameDataRef.current;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, swipeTouchRef.current.paddleX + delta));
        const attached = balls?.find((b) => b.attached);
        if (attached) attached.x = paddle.x + paddle.width / 2;
        setPaddleState({ x: paddle.x, width: paddle.width });
      } else {
        movePaddle(touch.clientX);
      }
    };
    const onTouchEnd = () => { swipeTouchRef.current = null; };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [movePaddle]);

  // Clear stale brick animations on new level/game
  useEffect(() => {
    if (gameState === GAME_STATES.READY) {
      brickAnims.clear();
    }
  }, [gameState]);

  // ── Game loop + draw ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameCount = 0;

    const addShake = (intensity) => {
      shakeRef.current.intensity = Math.min(shakeRef.current.intensity + intensity, 12);
    };

    // Sound callbacks forwarded into updateGame
    const soundCallbacks = {
      onPaddleHit: () => { soundPaddleHit(); addShake(1.5); },
      onWallHit: soundWallHit,
      onBrickHit: (brick) => {
        soundBrickHit(); addShake(brick ? brick.maxHits * 1.2 : 1.5);
        if (brick) {
          triggerBrickHit(brick);
          // Bounce scale animation
          const k = getBrickKey(brick);
          brickBounceRef.current.set(k, 1.18);
        }
      },
      onBrickDestroy: (brick) => { soundBrickDestroy(); addShake(brick ? brick.maxHits * 2.5 : 3); if (brick) { triggerBrickDestroy(brick); onAchievement?.("brick_destroyed", { isBoss: brick.isBoss }); } },
      onPowerupCatch: (type) => { soundPowerupCatch(); onAchievement?.("powerup", { type }); },
      onLifeLost: () => { soundLifeLost(); addShake(10); vignetteRef.current = { alpha: 1, color: "#ff0000" }; onLifeLost(); },
      onLevelComplete: () => { soundLevelComplete(); flashRef.current = { alpha: 1, color: "#a855f7" }; onLevelComplete(); },
    };

    const draw = () => {
      frameCount++;

      // ── Screen shake ────────────────────────────────────────────────
      const shake = shakeRef.current;
      const sx = shake.intensity > 0.1 ? (Math.random() - 0.5) * shake.intensity : 0;
      const sy = shake.intensity > 0.1 ? (Math.random() - 0.5) * shake.intensity : 0;
      shake.intensity *= shake.decay;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.clearRect(-Math.abs(sx) - 2, -Math.abs(sy) - 2, CANVAS_WIDTH + 4, CANVAS_HEIGHT + 4);

      if (!gameDataRef.current) { ctx.restore(); return; }
      const { paddle, balls, bricks, particles, powerups, lasers, activeEffects } = gameDataRef.current;
      const now = Date.now();

      // ── Active skin ──────────────────────────────────────────────────
      const activeSkin = getActiveSkin();
      const skinColor = activeSkin.color ?? getRainbowColor(frameCount);
      const skinGlow  = activeSkin.glow  ?? getRainbowColor(frameCount + 60);
      const activePaddleSkin = getActivePaddleSkin();

      // ── Update ball trails ───────────────────────────────────────────
      balls.forEach((ball, idx) => {
        if (ball.attached) { trailsRef.current.delete(idx); return; }
        const trail = trailsRef.current.get(idx) || [];
        trail.push({ x: ball.x, y: ball.y, r: ball.radius, fireball: ball.fireball });
        if (trail.length > TRAIL_LEN) trail.shift();
        trailsRef.current.set(idx, trail);
      });
      // Remove trails for dead balls
      for (const k of trailsRef.current.keys()) {
        if (!balls[k]) trailsRef.current.delete(k);
      }

      // ── Draw ball trails (every other point for perf) ────────────────
      for (const trail of trailsRef.current.values()) {
        trail.forEach((pt, i) => {
          if (i % 2 !== 0) return; // skip every other point
          const frac = i / trail.length;
          const alpha = frac * 0.3;
          const radius = Math.max(0.5, pt.r * frac * 0.7);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = pt.fireball ? "#f97316" : skinColor;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // ── Bricks ──────────────────────────────────────────────────────
      for (const brick of bricks) {
        if (!brick.alive) continue;
        const opacity = brick.hits / brick.maxHits;
        const alpha = 0.5 + opacity * 0.5;

        if (brick.indestructible) {
          // Steel cross-hatch style
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#1e293b";
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
          ctx.fill();
          // Rivets / cross lines
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.roundRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height - 4, 2);
          ctx.fill();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(brick.x + brick.width / 2, brick.y + 3);
          ctx.lineTo(brick.x + brick.width / 2, brick.y + brick.height - 3);
          ctx.moveTo(brick.x + 6, brick.y + brick.height / 2);
          ctx.lineTo(brick.x + brick.width - 6, brick.y + brick.height / 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1;
        } else if (brick.isBoss) {
          // Boss: pulsing red glow, HP bar
          const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.1);
          ctx.shadowColor = "#ff0055";
          ctx.shadowBlur = 30 + pulse * 20;
          ctx.fillStyle = `hsl(${340 + pulse * 20}, 100%, ${35 + pulse * 15}%)`;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 8);
          ctx.fill();
          // Gloss
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(brick.x + 4, brick.y + 4, brick.width - 8, brick.height / 2 - 4, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          // HP bar
          const hpRatio = brick.hits / brick.maxHits;
          ctx.fillStyle = "#330011";
          ctx.beginPath();
          ctx.roundRect(brick.x + 6, brick.y + brick.height - 10, brick.width - 12, 6, 3);
          ctx.fill();
          ctx.fillStyle = hpRatio > 0.5 ? "#ff0055" : hpRatio > 0.25 ? "#ff6600" : "#ff0000";
          ctx.beginPath();
          ctx.roundRect(brick.x + 6, brick.y + brick.height - 10, (brick.width - 12) * hpRatio, 6, 3);
          ctx.fill();
          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px 'Orbitron', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = 0.95;
          ctx.fillText(`BOSS  ${brick.hits}/${brick.maxHits}`, brick.x + brick.width / 2, brick.y + brick.height / 2 - 4);
          ctx.globalAlpha = 1;
        } else {
          // No per-brick shadowBlur for tablet perf — just flat colored brick
          ctx.shadowBlur = 0;
          ctx.fillStyle = brick.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
          ctx.fill();

          // Simple top gloss only
          ctx.globalAlpha = 0.22 * alpha;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height / 2 - 2, 2);
          ctx.fill();

          ctx.globalAlpha = 1;

          if (brick.maxHits > 1) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px 'Orbitron', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = 0.85;
            ctx.fillText(brick.hits.toString(), brick.x + brick.width / 2, brick.y + brick.height / 2);
            ctx.globalAlpha = 1;
          }

          // Hit flash overlay + bounce scale
          const bk = getBrickKey(brick);
          const banim = brickAnims.get(bk);
          const bounceScale = brickBounceRef.current.get(bk) || 1;
          if (bounceScale > 1) {
            // Redraw brick at bounce scale (centered)
            const cx2 = brick.x + brick.width / 2;
            const cy2 = brick.y + brick.height / 2;
            const bw2 = brick.width * bounceScale;
            const bh2 = brick.height * bounceScale;
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = brick.color;
            ctx.shadowColor = brick.glow;
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.roundRect(cx2 - bw2 / 2, cy2 - bh2 / 2, bw2, bh2, 6);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            brickBounceRef.current.set(bk, Math.max(1, bounceScale - 0.055));
            if (bounceScale - 0.055 <= 1) brickBounceRef.current.delete(bk);
          }
          if (banim && banim.flash > 0) {
            ctx.globalAlpha = banim.flash * 0.6;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
            ctx.fill();
            ctx.globalAlpha = 1;
            banim.flash = Math.max(0, banim.flash - 0.12);
          }

          // Explosive brick indicator: pulsing orange ring
          if (brick.explosive && brick.alive) {
            const expPulse = 0.5 + 0.5 * Math.sin(frameCount * 0.18 + brick.x * 0.05);
            ctx.globalAlpha = 0.5 + expPulse * 0.4;
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#f97316";
            ctx.shadowBlur = 8 + expPulse * 10;
            ctx.beginPath();
            ctx.roundRect(brick.x + 1, brick.y + 1, brick.width - 2, brick.height - 2, 4);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            // Bomb icon
            ctx.fillStyle = "#fff";
            ctx.font = "9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = 0.9;
            ctx.fillText("💥", brick.x + brick.width / 2, brick.y + brick.height / 2);
            ctx.globalAlpha = 1;
          }

          if (brick.hasDrop && brick.alive) {
            const info = POWERUP_TYPES[brick.dropType];
            const pulse = 0.75 + 0.25 * Math.sin(frameCount * 0.15);
            ctx.globalAlpha = pulse;
            // Glowing dot
            ctx.fillStyle = info.color;
            ctx.shadowColor = info.glow;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(brick.x + brick.width - 7, brick.y + 7, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Label inside dot
            ctx.globalAlpha = pulse * 0.95;
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 5px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(info.label, brick.x + brick.width - 7, brick.y + 7);
            ctx.globalAlpha = 1;
          }
        }
      }

      // ── Brick destroy scale-out animations ──────────────────────────
      for (const [, anim] of brickAnims) {
        if (!anim.destroy || anim.destroy <= 0) continue;
        const scale = 1 + (1 - anim.destroy) * 0.6;
        ctx.save();
        ctx.globalAlpha = anim.destroy * 0.5;
        ctx.fillStyle = anim.color || "#ffffff";
        ctx.shadowColor = anim.color || "#ffffff";
        ctx.shadowBlur = 20 * anim.destroy;
        // We can't know exact position here so just decay
        anim.destroy = Math.max(0, anim.destroy - 0.08);
        ctx.restore();
      }

      // ── Particles — no shadowBlur for tablet perf ───────────────────
      ctx.shadowBlur = 0;
      for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        if (p.type === "ring") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2 * p.life;
          ctx.globalAlpha = p.life * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.maxRadius * (1 - p.life), 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (p.type === "spark") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * p.life;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.dx * 3, p.y - p.dy * 3);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else {
          ctx.fillStyle = p.color;
          // Use fillRect instead of arc for speed
          const r = Math.max(0.5, p.size * p.life);
          ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;

      // ── Score popups ────────────────────────────────────────────────
      const scorePopups = gameDataRef.current.scorePopups || [];
      ctx.shadowBlur = 0;
      ctx.font = "bold 13px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const sp of scorePopups) {
        ctx.globalAlpha = Math.min(1, sp.life * 2);
        ctx.fillStyle = sp.color;
        ctx.fillText(sp.text, sp.x, sp.y);
      }
      ctx.globalAlpha = 1;

      // ── Power-up capsules ───────────────────────────────────────────
      for (const pu of powerups) {
        const info = POWERUP_TYPES[pu.type];
        ctx.shadowBlur = 0;

        ctx.fillStyle = info.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.roundRect(pu.x, pu.y, pu.width, pu.height, pu.height / 2);
        ctx.fill();

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(pu.x + 3, pu.y + 2, pu.width - 6, pu.height / 2 - 2, 3);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(info.label, pu.x + pu.width / 2, pu.y + pu.height / 2);
      }

      // ── Lasers ──────────────────────────────────────────────────────
      for (const l of lasers) {
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#fde047";
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.roundRect(l.x, l.y, l.width, l.height, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // ── Paddle ──────────────────────────────────────────────────────
      const isWide    = activeEffects.WIDE_PADDLE    && activeEffects.WIDE_PADDLE    > now;
      const isShrunk  = activeEffects.SHRINK_PADDLE  && activeEffects.SHRINK_PADDLE  > now;
      const isLaser   = activeEffects.LASER          && activeEffects.LASER          > now;
      const isSticky  = activeEffects.STICKY         && activeEffects.STICKY         > now;
      const isMagnet   = activeEffects.MAGNET         && activeEffects.MAGNET         > now;
      const isTimeWarp  = activeEffects.TIME_WARP      && activeEffects.TIME_WARP      > now;
      const isGhost     = activeEffects.GHOST_BALL     && activeEffects.GHOST_BALL     > now;
      const isShield    = activeEffects.SHIELD         && activeEffects.SHIELD         > now;

      const pc1 = isWide ? "#22c55e" : isShrunk ? "#94a3b8" : isLaser ? "#eab308" : isSticky ? "#ec4899" : isMagnet ? "#d946ef" : isTimeWarp ? "#67e8f9" : isGhost ? "#c4b5fd" : activePaddleSkin.color1;
      const pc2 = isWide ? "#4ade80" : isShrunk ? "#cbd5e1" : isLaser ? "#fde047" : isSticky ? "#f472b6" : isMagnet ? "#f0abfc" : isTimeWarp ? "#a5f3fc" : isGhost ? "#ede9fe" : activePaddleSkin.color2;

      const pg = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
      pg.addColorStop(0, pc1); pg.addColorStop(0.5, pc2); pg.addColorStop(1, pc1);

      ctx.shadowColor = pc1;
      ctx.shadowBlur = 10;
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 7);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(paddle.x + 4, paddle.y + 2, paddle.width - 8, paddle.height / 2 - 1, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isLaser) {
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 8 + 4 * Math.sin(frameCount * 0.2);
        ctx.beginPath();
        ctx.roundRect(paddle.x + 2, paddle.y - 5, 6, 7, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(paddle.x + paddle.width - 8, paddle.y - 5, 6, 7, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Balls ────────────────────────────────────────────────────────
      for (const ball of balls) {
        const isFireball = ball.fireball;
        const isGhostBall = ball.ghost;
        const ballColor = isFireball ? "#f97316" : isGhostBall ? "#c4b5fd" : skinColor;
        const ballGlow  = isFireball ? "#ef4444" : isGhostBall ? "#8b5cf6" : skinGlow;

        ctx.shadowColor = ballGlow;
        ctx.shadowBlur = isFireball ? 10 : isGhostBall ? 8 : 6;
        ctx.fillStyle = ballColor;
        ctx.globalAlpha = isGhostBall ? 0.55 + 0.2 * Math.sin(frameCount * 0.18) : 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x - 1.5, ball.y - 1.5, ball.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isFireball) {
          // Simplified: just a small orange ring, no shadowBlur
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius * 1.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1;
        }
      }

      // ── Shield bar ───────────────────────────────────────────────────
      if (isShield) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(4, CANVAS_HEIGHT - 4);
        ctx.lineTo(CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
      }

      // ── Time Warp cyan vignette ──────────────────────────────────────
      if (isTimeWarp) {
        const twPulse = 0.5 + 0.5 * Math.sin(frameCount * 0.08);
        ctx.globalAlpha = 0.06 + twPulse * 0.06;
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1;
      }

      // ── Screen flash ─────────────────────────────────────────────────
      const flash = flashRef.current;
      if (flash.alpha > 0) {
        ctx.globalAlpha = flash.alpha * 0.55;
        ctx.fillStyle = flash.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1;
        flash.alpha = Math.max(0, flash.alpha - 0.04);
      }

      // ── Life-lost vignette pulse ─────────────────────────────────────
      const vignette = vignetteRef.current;
      if (vignette.alpha > 0) {
        const grad = ctx.createRadialGradient(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.25,
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.75
        );
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, `rgba(220,0,0,${vignette.alpha * 0.75})`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        vignette.alpha = Math.max(0, vignette.alpha - 0.035);
      }

      // ── Pause dim overlay ────────────────────────────────────────────
      ctx.restore();
      if (gameState === GAME_STATES.PAUSED) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    };

    const PADDLE_SPEED = 10;

    const loop = () => {
      // ── Keyboard paddle movement ─────────────────────────────────────
      if (gameDataRef.current && (keysRef.current.left || keysRef.current.right)) {
        const { paddle, balls } = gameDataRef.current;
        const dir = keysRef.current.left ? -1 : 1;
        paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x + dir * PADDLE_SPEED));
        const attachedBall = balls?.find((b) => b.attached);
        if (attachedBall) attachedBall.x = paddle.x + paddle.width / 2;
        setPaddleState({ x: paddle.x, width: paddle.width });
      }

      if (gameState === GAME_STATES.PLAYING && gameDataRef.current) {
        updateGame(
          gameDataRef.current,
          onScoreUpdate,
          soundCallbacks.onLifeLost,
          soundCallbacks.onLevelComplete,
          onExtraLife,
          soundCallbacks,
          (c, mult) => {
            onComboChange?.(c, mult);
            onAchievement?.("combo", { combo: c });
            if (c === 3 || c === 5 || c >= 8) soundComboVoice(c);
          }
        );
        // Only notify effects every 6 frames to avoid constant React re-renders
        if (onEffectsChange && gameDataRef.current && frameCount % 6 === 0) {
          onEffectsChange({ ...gameDataRef.current.activeEffects });
        }
      }
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameState, gameDataRef, onScoreUpdate, onLifeLost, onLevelComplete, onExtraLife, onEffectsChange, onComboChange, onAchievement]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-border/50 overflow-hidden w-full max-w-[540px] ${gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.READY ? "cursor-none" : "cursor-default"}`}
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      onClick={gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.READY ? handleClick : undefined}
    >
      <BackgroundCanvas
        paddleX={paddleState.x}
        paddleWidth={paddleState.width}
        level={level}
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute inset-0 w-full h-full cursor-none pointer-events-none"
        style={{ touchAction: "none" }}
      />
      {children}
    </div>
  );
}