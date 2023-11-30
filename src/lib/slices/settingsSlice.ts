import { type StateCreator } from "zustand";

export interface SettingsSlice {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
});
