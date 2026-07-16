"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import { defaultGameState } from "./defaultState";
import { gameReducer } from "./gameRules";
import { loadGameState, saveGameState } from "./storage";
import { clearSyncUrl, readSyncStateFromUrl } from "./syncState";
import { isCloudSyncConfigured, loadCloudState, saveCloudState } from "./cloudSync";
import type { GameAction, GameState } from "./gameTypes";

export type SyncStatus = {
  source: "local" | "cloud";
  online: boolean;
  loading: boolean;
  lastSyncedAt?: string;
  lastError?: string;
};

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  ready: boolean;
  syncStatus: SyncStatus;
};

const GameContext = createContext<GameContextValue | null>(null);

function createInitialSyncStatus(): SyncStatus {
  return {
    source: isCloudSyncConfigured() ? "cloud" : "local",
    online: false,
    loading: isCloudSyncConfigured(),
    lastError: isCloudSyncConfigured() ? undefined : "云同步未配置，当前使用本地数据。"
  };
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "云端同步失败。";
}

function syncedStatus(updatedAt = Date.now()): SyncStatus {
  return {
    source: "cloud",
    online: true,
    loading: false,
    lastSyncedAt: new Date(updatedAt).toISOString()
  };
}

function errorStatus(error: unknown): SyncStatus {
  return {
    source: isCloudSyncConfigured() ? "cloud" : "local",
    online: false,
    loading: false,
    lastError: toErrorMessage(error)
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, reducerDispatch] = useReducer(gameReducer, defaultGameState);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => createInitialSyncStatus());
  const cloudReadyRef = useRef(false);
  const lastCloudUpdatedAtRef = useRef(0);
  const lastCloudRevisionRef = useRef<number | undefined>(undefined);
  const localDirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useCallback<Dispatch<GameAction>>((action) => {
    if (action.type !== "HYDRATE") {
      localDirtyRef.current = true;
    }

    reducerDispatch(action);
  }, []);

  useEffect(() => {
    const syncedState = readSyncStateFromUrl();
    const saved = syncedState ?? loadGameState();
    reducerDispatch({ type: "HYDRATE", state: saved });
    if (syncedState) {
      clearSyncUrl();
    }
    setReady(true);

    if (!isCloudSyncConfigured()) {
      return;
    }

    setSyncStatus((current) => ({ ...current, loading: true, lastError: undefined }));

    void loadCloudState()
      .then((cloudState) => {
        if (cloudState) {
          lastCloudUpdatedAtRef.current = cloudState.updatedAt;
          lastCloudRevisionRef.current = cloudState.revision;
          reducerDispatch({ type: "HYDRATE", state: cloudState.state });
        } else {
          const now = Date.now();
          lastCloudUpdatedAtRef.current = now;
          void saveCloudState(saved, now, lastCloudRevisionRef.current).then((created) => {
            if (created?.revision) {
              lastCloudRevisionRef.current = created.revision;
            }
          });
        }
        cloudReadyRef.current = true;
        setSyncStatus(syncedStatus(lastCloudUpdatedAtRef.current || Date.now()));
      })
      .catch((error) => {
        cloudReadyRef.current = true;
        setSyncStatus(errorStatus(error));
      });
  }, []);

  useEffect(() => {
    if (ready) {
      saveGameState(state);
    }
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !isCloudSyncConfigured() || !cloudReadyRef.current || !localDirtyRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const updatedAt = Date.now();
      const revision = lastCloudRevisionRef.current;
      setSyncStatus((current) => ({ ...current, loading: true, lastError: undefined }));
      void saveCloudState(state, updatedAt, revision)
        .then((saved) => {
          if (saved?.conflict) {
            localDirtyRef.current = false;
            lastCloudUpdatedAtRef.current = saved.updatedAt;
            lastCloudRevisionRef.current = saved.revision;
            reducerDispatch({ type: "HYDRATE", state: saved.state });
            setSyncStatus(syncedStatus(saved.updatedAt));
            return;
          }

          localDirtyRef.current = false;
          lastCloudUpdatedAtRef.current = saved?.updatedAt ?? updatedAt;
          lastCloudRevisionRef.current = saved?.revision ?? lastCloudRevisionRef.current;
          setSyncStatus(syncedStatus(lastCloudUpdatedAtRef.current));
        })
        .catch((error) => setSyncStatus(errorStatus(error)));
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
          if (cloudState && cloudState.updatedAt > lastCloudUpdatedAtRef.current && !localDirtyRef.current) {
            lastCloudUpdatedAtRef.current = cloudState.updatedAt;
            lastCloudRevisionRef.current = cloudState.revision;
            reducerDispatch({ type: "HYDRATE", state: cloudState.state });
          }
          setSyncStatus(syncedStatus(cloudState?.updatedAt ?? (lastCloudUpdatedAtRef.current || Date.now())));
        })
        .catch((error) => setSyncStatus(errorStatus(error)));
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
