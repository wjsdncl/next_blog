"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { useShallow } from "zustand/shallow";
import { CloseBold } from "@/Icons/Close";
import useModalStore from "@/stores/ModalStore";

export default function Modal() {
  const { modals, closeModal } = useModalStore(
    useShallow((state) => ({
      modals: state.modals,
      closeModal: state.closeModal,
    }))
  );

  const handleBackgroundClick = ({ event, id }: { event: React.MouseEvent<HTMLDivElement>; id: number }) => {
    if (event.target === event.currentTarget) {
      closeModal(id);
    }
  };

  return (
    <>
      {modals.map((modal, index) => (
        <div
          key={modal.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black_opacity-10 backdrop-blur-sm transition-all duration-300 ease-in-out"
          style={{ zIndex: 1000 + index }}
          onMouseDown={(e) => handleBackgroundClick({ event: e, id: modal.id })}
        >
          <div
            className="relative w-[90%] max-w-md animate-fade-in rounded-lg border-4 border-gray-300 bg-background-primary p-6 pt-8 text-text-primary shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => closeModal(modal.id)} className="absolute right-3 top-3 size-6">
              <CloseBold width={"100%"} height={"100%"} />
            </button>
            {modal.title === "" ? null : <h2 className="mb-4 text-xl font-semibold">{modal.title}</h2>}
            <div>{modal.content}</div>
          </div>
        </div>
      ))}
    </>
  );
}
