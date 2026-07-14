"use client";

import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import { defaultGameState } from "./defaultState";
import { gameReducer } from "./gameRules";
import { loadGameState, saveGameState } from "./storage";
import { clearSyncUrl, readSyncStateFromUrl } from "./syncState";
import { isCloudSyncConfigured, loadCloudState, saveCloudState } from "./cloudSync";
import type { GameAction, GameState } from "./gameTypes";

type SyncStatus = "local" | "loading" | "synced" | "error";

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  ready: boolean;
  syncStatus: SyncStatus;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, defaultGameState);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isCloudSyncConfigured() ? "loading" : "local");
  const cloudReadyRef = useRef(false);
  const lastCloudUpdatedAtRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const syncedState = readSyncStateFromUrl();
    const saved = syncedState ?? loadGameState();
    dispatch({ type: "HYDRATE", state: saved });
    if (syncedState) {
      clearSyncUrl();
    }
    setReady(true);

    if (!isCloudSyncConfigured()) {
      return;
    }

    void loadCloudState()
      .then((cloudState) => {
        if (cloudState) {
          lastCloudUpdatedAtRef.current = cloudState.updatedAt;
          dispatch({ type: "HYDRATE", state: cloudState.state });
        } else {
          const now = Date.now();
          lastCloudUpdatedAtRef.current = now;
          void saveCloudState(saved, now);
        }
        cloudReadyRef.current = true;
        setSyncStatus("synced");
      })
      .catch(() => {
        cloudReadyRef.current = true;
        setSyncStatus("error");
      });
  }, []);

  useEffect(() => {
    if (ready) {
      saveGameState(state);
    }
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !isCloudSyncConfigured() || !cloudReadyRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const updatedAt = Date.now();
      void saveCloudState(state, updatedAt)
        .then(() => {
          lastCloudUpdatedAtRef.current = updatedAt;
          setSyncStatus("synced");
        })
        .catch(() => setSyncStatus("error"));
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [ready, state]);

  useEffect(() => {
    if (!isCloudSyncConfigured()) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!cloudReadyRef.current) {
        return;
      }

      void loadCloudState()
        .then((cloudState) => {
          if (cloudState && cloudState.updatedAt > lastCloudUpdatedAtRef.current) {
            lastCloudUpdatedAtRef.current = cloudState.updatedAt;
            dispatch({ type: "HYDRATE", state: cloudState.state });
          }
          setSyncStatus("synced");
        })
        .catch(() => setSyncStatus("error"));
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  return <GameContext.Provider value={{ state, dispatch, ready, syncStatus }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
