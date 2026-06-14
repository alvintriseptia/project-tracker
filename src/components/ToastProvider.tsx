import * as Toast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastContextValue = {
  announce: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const announce = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    setOpen(false);
    window.setTimeout(() => setOpen(true), 0);
  }, []);
  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        duration={3500}
        className="rounded-xl border border-line bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl"
      >
        <Toast.Description>{message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed right-4 top-4 z-[80] grid w-[min(360px,calc(100vw-2rem))] gap-2" />
    </Toast.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return value;
}
