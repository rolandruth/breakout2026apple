import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ScoreSubmit({ score, level, onDone }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await base44.entities.Score.create({ player_name: name.trim(), score, level });
    setSubmitted(true);
    setLoading(false);
    setTimeout(onDone, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 w-full"
    >
      {submitted ? (
        <div className="flex items-center gap-2 text-green-400 font-inter text-sm">
          <CheckCircle className="w-4 h-4" />
          Score saved!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
          <input
            type="text"
            maxLength={16}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" disabled={loading || !name.trim()} className="font-orbitron text-xs">
            {loading ? "..." : "SAVE"}
          </Button>
        </form>
      )}
    </motion.div>
  );
}