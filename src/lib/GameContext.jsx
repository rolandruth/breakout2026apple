import React, { createContext, useContext } from "react";

export const GameContext = createContext(null);

export function useGameContext() {
  return useContext(GameContext);
}