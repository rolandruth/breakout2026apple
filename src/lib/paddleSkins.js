// Paddle skin definitions
// unlock: { type: "default"|"score"|"level", value: number }

const HS_KEY = "neonbreakout_highscore";
const LEVEL_KEY = "breakout2026_maxlevel";
const STORAGE_KEY = "breakout2026_paddleskin";

export const PADDLE_SKINS = [
  {
    id: "classic",
    name: "Classic",
    color1: "#a855f7",
    color2: "#c084fc",
    emoji: "🟣",
    unlock: { type: "default" },
    desc: "The original purple paddle",
    lockDesc: "Default skin",
  },
  {
    id: "neon",
    name: "Neon",
    color1: "#22d3ee",
    color2: "#67e8f9",
    emoji: "💙",
    unlock: { type: "score", value: 1000 },
    desc: "Electric cyan glow",
    lockDesc: "Reach 1,000 pts",
  },
  {
    id: "fire",
    name: "Inferno",
    color1: "#f97316",
    color2: "#fde047",
    emoji: "🔥",
    unlock: { type: "score", value: 3000 },
    desc: "Blazing orange-gold",
    lockDesc: "Reach 3,000 pts",
  },
  {
    id: "ice",
    name: "Glacier",
    color1: "#bae6fd",
    color2: "#e0f2fe",
    emoji: "❄️",
    unlock: { type: "level", value: 5 },
    desc: "Frosty white-blue",
    lockDesc: "Reach level 5",
  },
  {
    id: "toxic",
    name: "Toxic",
    color1: "#4ade80",
    color2: "#86efac",
    emoji: "☢️",
    unlock: { type: "level", value: 10 },
    desc: "Radioactive green",
    lockDesc: "Reach level 10",
  },
  {
    id: "rose",
    name: "Rose",
    color1: "#f43f5e",
    color2: "#fb7185",
    emoji: "🌹",
    unlock: { type: "score", value: 7500 },
    desc: "Deep crimson glow",
    lockDesc: "Reach 7,500 pts",
  },
  {
    id: "gold",
    name: "Gilded",
    color1: "#fbbf24",
    color2: "#fde68a",
    emoji: "✨",
    unlock: { type: "score", value: 15000 },
    desc: "Pure gold shimmer",
    lockDesc: "Reach 15,000 pts",
  },
  {
    id: "void",
    name: "Void",
    color1: "#6366f1",
    color2: "#818cf8",
    emoji: "🌑",
    unlock: { type: "level", value: 20 },
    desc: "Dark cosmic indigo",
    lockDesc: "Reach level 20",
  },
];

function getMaxScore() {
  // Use the best score across all difficulties
  const diffs = ["easy", "normal", "hard", "insane"];
  return Math.max(0, ...diffs.map(d => parseInt(localStorage.getItem(`${HS_KEY}_${d}`) || "0", 10)));
}
function getMaxLevel() {
  return parseInt(localStorage.getItem(LEVEL_KEY) || "1", 10);
}

export function getSelectedPaddleSkin() {
  return localStorage.getItem(STORAGE_KEY) || "classic";
}

export function setSelectedPaddleSkin(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

export function isPaddleSkinUnlocked(skin) {
  if (skin.unlock.type === "default") return true;
  if (skin.unlock.type === "score") return getMaxScore() >= skin.unlock.value;
  if (skin.unlock.type === "level") return getMaxLevel() >= skin.unlock.value;
  return false;
}

export function getActivePaddleSkin() {
  const id = getSelectedPaddleSkin();
  return PADDLE_SKINS.find((s) => s.id === id) || PADDLE_SKINS[0];
}