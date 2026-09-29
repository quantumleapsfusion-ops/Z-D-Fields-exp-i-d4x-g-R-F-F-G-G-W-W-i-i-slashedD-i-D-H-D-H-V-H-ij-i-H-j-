import { create } from "zustand";

type CarryState = {
  text: string;
  boardId: string | null;
  setText: (text: string) => void;
  setBoardId: (boardId: string | null) => void;
};

export const useCarry = create<CarryState>((set) => ({
  text: "",
  boardId: null,
  setText: (text) => set({ text }),
  setBoardId: (boardId) => set({ boardId }),
}));
