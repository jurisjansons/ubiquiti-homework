import { type StateCreator } from "zustand";
import { type Modal } from "~/app/_constants/modals";

import { v4 } from "uuid";

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export interface ModalsSlice {
  modals: Modal[];
  openModal: (modal: DistributiveOmit<Modal, "id">) => void;
  closeModal: (id: string) => void;
}

export const createModalsSlice: StateCreator<ModalsSlice> = (set) => ({
  modals: [],
  openModal: (modal) => {
    set((state) => ({
      modals: [
        ...state.modals,
        {
          id: v4(),
          ...modal,
        },
      ],
    }));
  },
  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }));
  },
});
