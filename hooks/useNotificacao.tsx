import { useState, useCallback } from "react";
import { ToastType } from "@/components/Toast";

interface NotificacaoState {
  message: string;
  description?: string;
  type: ToastType;
  visible: boolean;
}

export function useNotificacao() {
  const [notificacao, setNotificacao] = useState<NotificacaoState>({
    message: "",
    description: "",
    type: "info",
    visible: false,
  });

  const showNotificacao = useCallback(
    (
      message: string,
      type: ToastType = "info",
      description?: string,
      duration = 3000,
    ) => {
      setNotificacao({
        message,
        type,
        description,
        visible: true,
      });

      setTimeout(() => {
        setNotificacao((prev) => ({ ...prev, visible: false }));
      }, duration);
    },
    [],
  );

  const success = useCallback(
    (message: string, description?: string) => {
      showNotificacao(message, "success", description);
    },
    [showNotificacao],
  );

  const error = useCallback(
    (message: string, description?: string) => {
      showNotificacao(message, "error", description);
    },
    [showNotificacao],
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      showNotificacao(message, "warning", description);
    },
    [showNotificacao],
  );

  const info = useCallback(
    (message: string, description?: string) => {
      showNotificacao(message, "info", description);
    },
    [showNotificacao],
  );

  const closeNotificacao = useCallback(() => {
    setNotificacao((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    notificacao,
    showNotificacao,
    success,
    error,
    warning,
    info,
    closeNotificacao,
  };
}
