"use client";

import { useShallow } from "zustand/shallow";
import { Close } from "@/Icons/Close";
import { Check, Info, Loading } from "@/Icons/Toast";
import useToastStore from "@/stores/ToastStore";

function Toaster() {
  const { toasts, removeToast } = useToastStore(
    useShallow((state) => ({
      toasts: state.toasts,
      removeToast: state.removeToast,
    }))
  );

  const animation = (type: string) => {
    switch (type) {
      case "error":
        return "animate-fade-shake";
      case "success":
      case "info":
      case "warning":
      default:
        return "animate-fade-in";
    }
  };

  const icon = (type: string) => {
    switch (type) {
      case "info":
        return (
          <div className="w-6">
            <Info width={24} height={24} color="#3B82F6" />
          </div>
        );
      case "success":
        return (
          <div className="size-6 pr-5">
            <Check />
          </div>
        );
      case "error":
        return (
          <div className="rounded-full bg-error p-1">
            <Close width={14} height={14} color="#fff" />
          </div>
        );
      case "warning":
        return <p className="text-[18px]">⚠️</p>;
      case "loading":
        return (
          <div className="animate-spin">
            <Loading width={16} height={16} />
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="fixed right-1/2 top-10 z-[100] flex w-max translate-x-1/2 flex-col items-center justify-center space-y-2 transition-all">
      {toasts.map((toast) => (
        <button
          type="button"
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`w-fit cursor-pointer justify-end rounded-lg border border-background-tertiary bg-background-primary p-4 text-lg font-medium text-text-primary shadow-lg transition-all ${animation(toast.type)}`}
        >
          <div className="flex items-center justify-between gap-2">
            {icon(toast.type)}
            <div>{toast.message}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default Toaster;
