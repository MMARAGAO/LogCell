"use client";

import { useState, useCallback } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  confirmColor?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolveCallback, setResolveCallback] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveCallback(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(false);
    }
    setIsOpen(false);
    setResolveCallback(null);
  }, [resolveCallback]);

  const handleConfirm = useCallback(() => {
    if (resolveCallback) {
      resolveCallback(true);
    }
    setIsOpen(false);
    setResolveCallback(null);
  }, [resolveCallback]);

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...options}
      />
    ),
    [isOpen, handleClose, handleConfirm, options]
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
