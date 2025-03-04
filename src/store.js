import { create } from "zustand";

export const useSceneStore = create((set) => ({
  currentScene: null,
  setScene: (scene) => set({ currentScene: scene }),
  showUI: false,
  setShowUI: (show) => set({ showUI: show }),
}));
