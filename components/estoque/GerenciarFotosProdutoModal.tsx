import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { useState, useEffect, useRef } from "react";
import {
  PhotoIcon,
  TrashIcon,
  StarIcon as StarOutline,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

import { FotoProduto } from "@/types";
import { CarrosselFotos } from "@/components/CarrosselFotos";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";

interface GerenciarFotosProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId: string;
  produtoNome: string;
  onLoadFotos: (produtoId: string) => Promise<FotoProduto[]>;
  onUploadFoto: (file: File, isPrincipal: boolean) => Promise<void>;
  onDeleteFoto: (fotoId: string) => Promise<void>;
  onSetPrincipal: (fotoId: string) => Promise<void>;
}

export default function GerenciarFotosProdutoModal({
  isOpen,
  onClose,
  produtoId,
  produtoNome,
  onLoadFotos,
  onUploadFoto,
  onDeleteFoto,
  onSetPrincipal,
}: GerenciarFotosProdutoModalProps) {
  const toast = useToast();
  const [fotos, setFotos] = useState<FotoProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fotoId: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && produtoId) {
      carregarFotos();
    }
  }, [isOpen, produtoId]);

  const carregarFotos = async () => {
    setLoading(true);
    try {
      const dados = await onLoadFotos(produtoId);

      setFotos(dados);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload de múltiplas fotos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPrincipal = fotos.length === 0 && i === 0; // Primeira foto é principal se não houver outras

        await onUploadFoto(file, isPrincipal);
      }

      // Recarregar fotos
      await carregarFotos();

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Fotos enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload das fotos. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fotoId: string) => {
    setConfirmModal({
      isOpen: true,
      fotoId: fotoId,
    });
  };

  const confirmarDelete = async () => {
    try {
      await onDeleteFoto(confirmModal.fotoId);
      await carregarFotos();
      toast.success("Foto excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      toast.error("Erro ao deletar foto. Tente novamente.");
    } finally {
      setConfirmModal({ isOpen: false, fotoId: "" });
    }
  };

  const handleSetPrincipal = async (fotoId: string) => {
    try {
      await onSetPrincipal(fotoId);
      await carregarFotos();
      toast.success("Foto principal definida com sucesso!");
    } catch (error) {
      console.error("Erro ao definir foto principal:", error);
      toast.error("Erro ao definir foto principal. Tente novamente.");
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>Gerenciar Fotos</span>
          <span className="text-sm text-default-500 font-normal">
            {produtoNome}
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Botão de Upload */}
            <div>
              <input
                ref={fileInputRef}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                type="file"
                onChange={handleFileSelect}
              />
              <Button
                color="primary"
                isDisabled={uploading}
                isLoading={uploading}
                startContent={<PhotoIcon className="w-5 h-5" />}
                onPress={() => fileInputRef.current?.click()}
              >
                {uploading ? "Enviando..." : "Adicionar Fotos"}
              </Button>
              <p className="text-xs text-default-500 mt-2">
                Formatos aceitos: JPG, PNG, WEBP (máx. 5MB cada)
              </p>
            </div>

            {/* Preview com Carrossel */}
            {fotos.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3">Preview:</p>
                <CarrosselFotos
                  fotos={fotos.map((f, index) => ({
                    id: index,
                    url: f.url,
                  }))}
                />
              </div>
            )}

            {/* Grid de Fotos */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner size="lg" />
              </div>
            ) : fotos.length > 0 ? (
              <div>
                <p className="text-sm font-semibold mb-3">
                  Todas as Fotos ({fotos.length}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {fotos.map((foto) => (
                    <div
                      key={foto.id}
                      className={`relative group border-2 rounded-lg overflow-hidden ${
                        fotoSelecionada === foto.id
                          ? "border-primary"
                          : "border-default-200"
                      }`}
                    >
                      {/* Imagem */}
                      <div className="aspect-square bg-default-100">
                        <img
                          alt={`Foto ${foto.ordem + 1}`}
                          className="w-full h-full object-cover"
                          src={foto.url}
                        />
                      </div>

                      {/* Badge Principal */}
                      {foto.is_principal && (
                        <div className="absolute top-2 left-2">
                          <Chip
                            color="warning"
                            size="sm"
                            startContent={<StarSolid className="w-3 h-3" />}
                            variant="solid"
                          >
                            Principal
                          </Chip>
                        </div>
                      )}

                      {/* Ações (visível no hover) */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!foto.is_principal && (
                          <Button
                            isIconOnly
                            color="warning"
                            size="sm"
                            title="Definir como principal"
                            variant="flat"
                            onPress={() => handleSetPrincipal(foto.id)}
                          >
                            <StarOutline className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          title="Excluir foto"
                          variant="flat"
                          onPress={() => handleDelete(foto.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-xs text-center">
                        Ordem: {foto.ordem + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-default-500">
                <PhotoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma foto adicionada ainda.</p>
                <p className="text-xs mt-1">
                  Clique em &quot;Adicionar Fotos&quot; para começar.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Confirm Modal */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="danger"
        confirmText="Excluir"
        isOpen={confirmModal.isOpen}
        message="Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita."
        title="Excluir Foto"
        onClose={() => setConfirmModal({ isOpen: false, fotoId: "" })}
        onConfirm={confirmarDelete}
      />

      {/* Toast Component */}
      {toast.ToastComponent}
    </Modal>
  );
}
