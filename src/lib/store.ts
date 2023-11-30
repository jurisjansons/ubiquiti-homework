import { create } from "zustand";

import {
  type SettingsSlice,
  createSettingsSlice,
} from "~/lib/slices/settingsSlice";
import { type ModalsSlice, createModalsSlice } from "./slices/modalsSlice";

import { persist } from "zustand/middleware";

type StoreState = SettingsSlice;

export const useAppStore = create<StoreState & ModalsSlice>()((...a) => ({
  ...persist(createSettingsSlice, {
    name: "settings",
  })(...a),
  ...createModalsSlice(...a),
}));
