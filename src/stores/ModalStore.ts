import { create } from "zustand";

interface Modal {
  id: number;
  content: React.ReactNode;
}

interface ModalState {
  modals: Modal[];
  modalCount: number;
  openModal: (content: React.ReactNode) => number;
  closeModal: (id: number) => void;
}

const useModalStore = create<ModalState>((set) => ({
  modals: [],
  modalCount: 1,
  openModal: (content) => {
    let newModalId: number = 0;
    set((state) => {
      newModalId = state.modalCount;
      return {
        modals: [...state.modals, { id: newModalId, content }],
        modalCount: state.modalCount + 1,
      };
    });
    return newModalId;
  },
  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    })),
}));

export default useModalStore;
