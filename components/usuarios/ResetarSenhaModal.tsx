"use client";

import type { Usuario } from "@/types";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useState, useEffect } from "react";
import { KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";

interface ResetarSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

export function ResetarSenhaModal({
  isOpen,
  onClose,
  usuario,
}: ResetarSenhaModalProps) {
  const toast = useToast();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNovaSenha("");
      setConfirmar("");
      setMostrar(false);
    }
  }, [isOpen]);

  const senhaCurta = novaSenha.length > 0 && novaSenha.length < 6;
  const naoConfere = confirmar.length > 0 && confirmar !== novaSenha;
  const podeSalvar =
    novaSenha.length >= 6 && confirmar === novaSenha && !salvando;

  const handleSalvar = async () => {
    if (!usuario || !podeSalvar) return;

    setSalvando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/usuarios/resetar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ usuarioId: usuario.id, novaSenha }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Erro ao resetar senha");

      toast.success(`Senha de ${usuario.nome} atualizada com sucesso!`);
      onClose();
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast.error(error.message || "Erro ao resetar senha");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-primary" />
            Resetar Senha
          </div>
          {usuario && (
            <p className="text-sm font-normal text-default-500">
              {usuario.nome} · {usuario.email}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              endContent={
                <button
                  aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                  className="text-default-400"
                  type="button"
                  onClick={() => setMostrar((v) => !v)}
                >
                  {mostrar ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              }
              errorMessage={senhaCurta ? "Mínimo de 6 caracteres" : undefined}
              isInvalid={senhaCurta}
              label="Nova senha"
              labelPlacement="outside"
              placeholder="Digite a nova senha"
              type={mostrar ? "text" : "password"}
              value={novaSenha}
              variant="bordered"
              onValueChange={setNovaSenha}
            />
            <Input
              errorMessage={naoConfere ? "As senhas não conferem" : undefined}
              isInvalid={naoConfere}
              label="Confirmar nova senha"
              labelPlacement="outside"
              placeholder="Repita a nova senha"
              type={mostrar ? "text" : "password"}
              value={confirmar}
              variant="bordered"
              onValueChange={setConfirmar}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!podeSalvar}
            isLoading={salvando}
            startContent={!salvando && <KeyIcon className="w-4 h-4" />}
            onPress={handleSalvar}
          >
            Resetar Senha
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
