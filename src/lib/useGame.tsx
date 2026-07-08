"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import { defaultGameState } from "./defaultState";
import { gameReducer } from "./gameRules";
import { loadGameState, saveGameState } from "./storage";
import { clearSyncHash, readSyncStateFromUrl } from "./syncState";
import type { GameAction, GameState } from "./gameTypes";

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  ready: boolean;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, defaultGameState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncedState = readSyncStateFromUrl();
    const saved = syncedState ?? loadGameState();
    dispatch({ type: "HYDRATE", state: saved });
    if (syncedState) {
      clearSyncHash();
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveGameState(state);
    }
  }, [ready, state]);

  return <GameContext.Provider value={{ state, dispatch, ready }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
