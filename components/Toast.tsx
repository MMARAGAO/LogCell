import { useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6 text-white" />;
      case "error":
        return <XCircleIcon className="w-6 h-6 text-white" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-6 h-6 text-white" />;
      case "info":
        return <InformationCircleIcon className="w-6 h-6 text-white" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-600/95 dark:bg-green-600/95";
      case "error":
        return "border-l-red-500 bg-red-600/95 dark:bg-red-600/95";
      case "warning":
        return "border-l-amber-500 bg-amber-600/95 dark:bg-amber-600/95";
      case "info":
        return "border-l-blue-500 bg-blue-600/95 dark:bg-blue-600/95";
    }
  };

  return (
    <Card
      className={`fixed top-4 right-4 z-[9999] border-l-4 ${getColors()} backdrop-blur-md shadow-lg animate-in slide-in-from-right-full duration-300`}
      style={{ minWidth: "320px", maxWidth: "500px" }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{message}</p>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onClose}
          className="shrink-0 text-white hover:bg-white/20"
        >
          <XMarkIcon className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// Hook para usar o Toast
import { useState, useCallback } from "react";

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    show: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, show: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const ToastComponent = toast.show ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return {
    showToast,
    hideToast,
    ToastComponent,
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
    warning: (message: string) => showToast(message, "warning"),
    info: (message: string) => showToast(message, "info"),
  };
}
