import { create } from "zustand";

import type { SoundPrint } from "@/lib/sound/analyse";

type CarryState = {
  text: string;
  boardId: string | null;
  sound: SoundPrint | null;
  setText: (text: string) => void;
  setBoardId: (boardId: string | null) => void;
  setSound: (sound: SoundPrint | null) => void;
};

export const useCarry = create<CarryState>((set) => ({
  text: "",
  boardId: null,
  sound: null,
  setText: (text) => set({ text }),
  setBoardId: (boardId) => set({ boardId }),
  setSound: (sound) => set({ sound }),
}));
