import React from "react";
import { NavLink } from "react-router-dom";
import { Gamepad2, Sparkles, Trophy, Settings } from "lucide-react";

const TABS = [
  { to: "/",          label: "Game",     Icon: Gamepad2 },
  { to: "/skins",     label: "Skins",    Icon: Sparkles },
  { to: "/scores",    label: "Scores",   Icon: Trophy },
  { to: "/settings",  label: "Settings", Icon: Settings },
];

export default function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border flex"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors no-underline"
          style={{ minHeight: 56 }}
        >
          {({ isActive }) => (
            <>
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              />
              <span
                className="font-orbitron text-[10px] tracking-wide font-bold transition-colors"
                style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ height: 3, width: 28, background: "hsl(var(--primary))" }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}