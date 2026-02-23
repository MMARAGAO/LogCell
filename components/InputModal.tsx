"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { useState } from "react";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  isRequired?: boolean;
  isLoading?: boolean;
  type?: "input" | "textarea";
}

export function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isRequired = true,
  isLoading = false,
  type = "input",
}: InputModalProps) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    if (isRequired && !value.trim()) {
      return;
    }
    onConfirm(value);
    setValue("");
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="center" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          {message && (
            <p className="text-sm text-default-600 mb-2">{message}</p>
          )}
          {type === "textarea" ? (
            <Textarea
              isRequired={isRequired}
              minRows={3}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Input
              isRequired={isRequired}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (!isRequired || value.trim())) {
                  handleConfirm();
                }
              }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {cancelText}
          </Button>
          <Button
            color="primary"
            isDisabled={isRequired && !value.trim()}
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
