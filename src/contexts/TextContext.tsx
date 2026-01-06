import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

type ToastMessage = {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info" | "warning";
};

type ToastContextType = {
  showToast: (title: string, description?: string, variant?: ToastMessage["variant"]) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProviderCustom = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, variant?: ToastMessage["variant"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} open variant={toast.variant}>
          <div>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProviderCustom");
  return ctx;
};
