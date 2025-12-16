"use client";

import { useState, useRef } from "react";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import {
  PhotoIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  uploadFotoAparelho,
  deletarFotoAparelho,
  definirFotoPrincipal,
} from "@/services/fotosAparelhosService";
import { FotoAparelho } from "@/types/aparelhos";
import { ConfirmModal } from "@/components/ConfirmModal";

interface FotosAparelhoUploadProps {
  aparelhoId: string;
  usuarioId: string;
  fotos: FotoAparelho[];
  onFotosChange: () => void;
}

export function FotosAparelhoUpload({
  aparelhoId,
  usuarioId,
  fotos,
  onFotosChange,
}: FotosAparelhoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fotoParaDeletar, setFotoParaDeletar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar todos os arquivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        setError("Todos os arquivos devem ser imagens");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`A imagem ${file.name} excede 5MB`);
        return;
      }
    }

    setError(null);
    setUploading(true);

    try {
      // Upload de cada arquivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPrincipal = fotos.length === 0 && i === 0; // Primeira foto é principal se não houver outras

        await uploadFotoAparelho(aparelhoId, file, usuarioId, isPrincipal);
      }

      onFotosChange();
    } catch (err) {
      setError("Erro ao fazer upload das fotos");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteClick = (fotoId: string) => {
    setFotoParaDeletar(fotoId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fotoParaDeletar) return;

    setDeletingId(fotoParaDeletar);
    setError(null);

    try {
      await deletarFotoAparelho(fotoParaDeletar);
      onFotosChange();
      setShowDeleteModal(false);
    } catch (err) {
      setError("Erro ao deletar foto");
      console.error(err);
    } finally {
      setDeletingId(null);
      setFotoParaDeletar(null);
    }
  };

  const handleDefinirPrincipal = async (fotoId: string) => {
    try {
      await definirFotoPrincipal(fotoId, aparelhoId);
      onFotosChange();
    } catch (err) {
      setError("Erro ao definir foto principal");
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fotos do Aparelho</h3>
          <Button
            color="primary"
            size="sm"
            startContent={<PhotoIcon className="w-4 h-4" />}
            onPress={() => fileInputRef.current?.click()}
            isDisabled={uploading}
          >
            Adicionar Fotos
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Spinner size="sm" />
            <span>Fazendo upload...</span>
          </div>
        )}

        {fotos.length === 0 && !uploading ? (
          <div className="border-2 border-dashed border-default-300 rounded-lg p-8 text-center">
            <PhotoIcon className="w-12 h-12 mx-auto text-default-400 mb-2" />
            <p className="text-default-500">Nenhuma foto adicionada</p>
            <p className="text-xs text-default-400 mt-1">
              Clique em "Adicionar Fotos" para fazer upload
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className="relative group border-2 rounded-lg overflow-hidden aspect-square"
                style={{
                  borderColor: foto.is_principal ? "#0070f0" : "transparent",
                }}
              >
                <Image
                  src={foto.url}
                  alt="Foto do aparelho"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {foto.is_principal && (
                  <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                    <StarIconSolid className="w-3 h-3" />
                    Principal
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!foto.is_principal && (
                    <Button
                      isIconOnly
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={() => handleDefinirPrincipal(foto.id)}
                      title="Definir como principal"
                    >
                      <StarIcon className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleDeleteClick(foto.id)}
                    isDisabled={deletingId === foto.id}
                    title="Deletar foto"
                  >
                    {deletingId === foto.id ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-default-500">
          Formatos aceitos: JPG, PNG, GIF (máx. 5MB por arquivo). Você pode
          selecionar múltiplas fotos.
        </p>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFotoParaDeletar(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Deletar Foto"
        message="Tem certeza que deseja deletar esta foto? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmColor="danger"
      />
    </>
  );
}
