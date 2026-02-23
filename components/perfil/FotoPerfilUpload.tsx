"use client";

import { useState, useRef } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { CameraIcon, TrashIcon } from "@heroicons/react/24/outline";

import { FotoPerfilService } from "@/services/fotoPerfilService";
import { FotoPerfil } from "@/types";
import { ConfirmModal } from "@/components/ConfirmModal";

interface FotoPerfilUploadProps {
  usuarioId: string;
  usuarioNome: string;
  fotoAtual?: FotoPerfil | null;
  onUploadSuccess: (url: string) => void;
}

export function FotoPerfilUpload({
  usuarioId,
  usuarioNome,
  fotoAtual,
  onUploadSuccess,
}: FotoPerfilUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validações
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setError("A imagem deve ter no máximo 5MB");

      return;
    }

    setError(null);
    setUploading(true);

    try {
      const result = await FotoPerfilService.uploadFoto(usuarioId, file);

      if (result.success && result.url) {
        onUploadSuccess(result.url);
      } else {
        setError(result.error || "Erro ao fazer upload");
      }
    } catch (err) {
      setError("Erro inesperado ao fazer upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fotoAtual) return;

    setDeleting(true);
    setError(null);

    try {
      const result = await FotoPerfilService.deletarFoto(
        fotoAtual.id,
        usuarioId,
      );

      if (result.success) {
        onUploadSuccess("");
        setShowDeleteModal(false);
      } else {
        setError(result.error || "Erro ao deletar foto");
      }
    } catch (err) {
      setError("Erro inesperado ao deletar foto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar
            isBordered
            showFallback
            className="w-32 h-32 text-4xl"
            color="primary"
            name={usuarioNome}
            src={fotoAtual?.url}
          />
          {(uploading || deleting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Spinner color="white" size="lg" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            color="primary"
            isDisabled={uploading || deleting}
            startContent={<CameraIcon className="w-5 h-5" />}
            onPress={() => fileInputRef.current?.click()}
          >
            {fotoAtual ? "Alterar Foto" : "Adicionar Foto"}
          </Button>

          {fotoAtual && (
            <Button
              color="danger"
              isDisabled={uploading || deleting}
              startContent={<TrashIcon className="w-5 h-5" />}
              variant="flat"
              onPress={() => setShowDeleteModal(true)}
            >
              Remover
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleFileSelect}
        />

        {error && (
          <p className="text-danger text-sm text-center max-w-xs">{error}</p>
        )}

        <p className="text-xs text-default-500 text-center max-w-xs">
          Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
        </p>
      </div>

      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="danger"
        confirmText="Excluir"
        isLoading={deleting}
        isOpen={showDeleteModal}
        message="Deseja realmente excluir sua foto de perfil? Esta ação não pode ser desfeita."
        title="Excluir Foto de Perfil"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
