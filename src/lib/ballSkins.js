// Ball skin definitions
// unlock: { type: "score"|"level"|"default", value: number }
export const BALL_SKINS = [
  {
    id: "classic",
    name: "Classic",
    color: "#22d3ee",
    glow: "#22d3ee",
    trailColor: "#22d3ee",
    emoji: "🔵",
    unlock: { type: "default" },
    desc: "The original cyan ball",
  },
  {
    id: "fire",
    name: "Fireball",
    color: "#f97316",
    glow: "#ef4444",
    trailColor: "#f97316",
    emoji: "🔥",
    unlock: { type: "score", value: 500 },
    desc: "Unlock at 500 points",
  },
  {
    id: "plasma",
    name: "Plasma",
    color: "#a855f7",
    glow: "#d946ef",
    trailColor: "#c084fc",
    emoji: "⚡",
    unlock: { type: "score", value: 2000 },
    desc: "Unlock at 2,000 points",
  },
  {
    id: "gold",
    name: "Gold",
    color: "#fde047",
    glow: "#eab308",
    trailColor: "#fbbf24",
    emoji: "✨",
    unlock: { type: "score", value: 5000 },
    desc: "Unlock at 5,000 points",
  },
  {
    id: "ice",
    name: "Ice",
    color: "#bae6fd",
    glow: "#38bdf8",
    trailColor: "#7dd3fc",
    emoji: "❄️",
    unlock: { type: "level", value: 5 },
    desc: "Unlock at level 5",
  },
  {
    id: "toxic",
    name: "Toxic",
    color: "#4ade80",
    glow: "#22c55e",
    trailColor: "#86efac",
    emoji: "☢️",
    unlock: { type: "level", value: 10 },
    desc: "Unlock at level 10",
  },
  {
    id: "void",
    name: "Void",
    color: "#1e1b4b",
    glow: "#6366f1",
    trailColor: "#4f46e5",
    emoji: "🌑",
    unlock: { type: "level", value: 20 },
    desc: "Unlock at level 20",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    color: null, // dynamic
    glow: null,
    trailColor: null,
    emoji: "🌈",
    unlock: { type: "score", value: 10000 },
    desc: "Unlock at 10,000 points",
  },
];

const STORAGE_KEY = "breakout2026_ballskin";
const HS_KEY = "neonbreakout_highscore";
const LEVEL_KEY = "breakout2026_maxlevel";

// Difficulty-based high scores
export function getDifficultyHighScore(difficulty) {
  return parseInt(localStorage.getItem(`${HS_KEY}_${difficulty}`) || "0", 10);
}
export function saveDifficultyHighScore(difficulty, score) {
  const cur = getDifficultyHighScore(difficulty);
  if (score > cur) localStorage.setItem(`${HS_KEY}_${difficulty}`, String(score));
}
export function getAllDifficultyHighScores() {
  return {
    easy:   getDifficultyHighScore("easy"),
    normal: getDifficultyHighScore("normal"),
    hard:   getDifficultyHighScore("hard"),
    insane: getDifficultyHighScore("insane"),
  };
}

export function getSelectedSkin() {
  return localStorage.getItem(STORAGE_KEY) || "classic";
}

export function setSelectedSkin(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

export function getMaxScore() {
  // Use the best score across all difficulties for skin unlock purposes
  const scores = getAllDifficultyHighScores();
  return Math.max(scores.easy, scores.normal, scores.hard, scores.insane);
}

export function getMaxLevel() {
  return parseInt(localStorage.getItem(LEVEL_KEY) || "1", 10);
}

export function saveMaxLevel(level) {
  const cur = getMaxLevel();
  if (level > cur) localStorage.setItem(LEVEL_KEY, String(level));
}

export function isSkinUnlocked(skin) {
  if (skin.unlock.type === "default") return true;
  if (skin.unlock.type === "score") return getMaxScore() >= skin.unlock.value;
  if (skin.unlock.type === "level") return getMaxLevel() >= skin.unlock.value;
  return false;
}

// Returns the skin object for the current selection
export function getActiveSkin() {
  const id = getSelectedSkin();
  return BALL_SKINS.find((s) => s.id === id) || BALL_SKINS[0];
}

// Rainbow hue cycle (call with frameCount)
export function getRainbowColor(frameCount) {
  const hue = (frameCount * 3) % 360;
  return `hsl(${hue}, 100%, 60%)`;
}