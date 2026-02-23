"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  confirmColor?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
  confirmColor = "danger",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <XCircle className="w-12 h-12 text-danger" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-warning" />;
      case "info":
        return <Info className="w-12 h-12 text-primary" />;
      case "success":
        return <CheckCircle className="w-12 h-12 text-success" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-warning" />;
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-3 bg-default-100 rounded-full">{getIcon()}</div>
            <p className="text-default-600">{message}</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {cancelText}
          </Button>
          <Button color={confirmColor} onPress={handleConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
