"use client";

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
import { FotoOrdemServico } from "@/types";
import {
  PhotoIcon,
  TrashIcon,
  StarIcon as StarOutline,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { CarrosselFotos } from "@/components/CarrosselFotos";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";

interface GerenciarFotosOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordemServicoId: string;
  numeroOS: number;
  onFotosAtualizadas?: () => void;
}

export default function GerenciarFotosOSModal({
  isOpen,
  onClose,
  ordemServicoId,
  numeroOS,
  onFotosAtualizadas,
}: GerenciarFotosOSModalProps) {
  const toast = useToast();
  const [fotos, setFotos] = useState<FotoOrdemServico[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fotoId: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && ordemServicoId) {
      carregarFotos();
    }
  }, [isOpen, ordemServicoId]);

  const carregarFotos = async () => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_fotos")
        .select("*")
        .eq("id_ordem_servico", ordemServicoId)
        .order("ordem", { ascending: true });

      if (error) throw error;

      setFotos((data || []) as FotoOrdemServico[]);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      toast.showToast("Erro ao carregar fotos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.showToast("Usuário não autenticado", "error");
        return;
      }

      // Upload de múltiplas fotos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPrincipal = fotos.length === 0 && i === 0;

        // Upload para o storage
        const fileName = `${ordemServicoId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ordem-servico-fotos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("ordem-servico-fotos").getPublicUrl(fileName);

        // Salvar no banco
        const { error: dbError } = await supabase
          .from("ordem_servico_fotos")
          .insert({
            id_ordem_servico: ordemServicoId,
            url: publicUrl,
            is_principal: isPrincipal,
            ordem: fotos.length + i,
          });

        if (dbError) throw dbError;
      }

      // Recarregar fotos
      await carregarFotos();

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.showToast("Fotos enviadas com sucesso!", "success");

      if (onFotosAtualizadas) {
        onFotosAtualizadas();
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.showToast("Erro ao fazer upload das fotos", "error");
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
      const { supabase } = await import("@/lib/supabaseClient");

      // Buscar a foto para deletar do storage
      const foto = fotos.find((f) => f.id === confirmModal.fotoId);
      if (foto) {
        // Extrair o caminho do arquivo da URL
        const urlParts = foto.url.split("/");
        const fileName = urlParts.slice(-2).join("/"); // id_ordem_servico/nome_arquivo

        // Deletar do storage
        await supabase.storage.from("ordem-servico-fotos").remove([fileName]);
      }

      // Deletar do banco
      const { error } = await supabase
        .from("ordem_servico_fotos")
        .delete()
        .eq("id", confirmModal.fotoId);

      if (error) throw error;

      await carregarFotos();
      toast.showToast("Foto excluída com sucesso!", "success");

      if (onFotosAtualizadas) {
        onFotosAtualizadas();
      }
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      toast.showToast("Erro ao deletar foto", "error");
    } finally {
      setConfirmModal({ isOpen: false, fotoId: "" });
    }
  };

  const handleSetPrincipal = async (fotoId: string) => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.showToast("Usuário não autenticado", "error");
        return;
      }

      // Atualizar foto principal (o trigger garante que só uma seja principal)
      const { error } = await supabase
        .from("ordem_servico_fotos")
        .update({
          is_principal: true,
          atualizado_por: user.id,
        })
        .eq("id", fotoId);

      if (error) throw error;

      await carregarFotos();
      toast.showToast("Foto principal definida!", "success");

      if (onFotosAtualizadas) {
        onFotosAtualizadas();
      }
    } catch (error) {
      console.error("Erro ao definir foto principal:", error);
      toast.showToast("Erro ao definir foto principal", "error");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span>Gerenciar Fotos</span>
            <span className="text-sm text-default-500 font-normal">
              Ordem de Serviço #{numeroOS}
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Botão de Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  color="primary"
                  startContent={<PhotoIcon className="w-5 h-5" />}
                  onPress={() => fileInputRef.current?.click()}
                  isLoading={uploading}
                  isDisabled={uploading}
                >
                  {uploading ? "Enviando..." : "Adicionar Fotos"}
                </Button>
                <p className="text-xs text-default-500 mt-2">
                  Você pode selecionar várias fotos de uma vez
                </p>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              )}

              {/* Preview com Carrossel */}
              {!loading && fotos.length > 0 && (
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

              {/* Lista de Fotos */}
              {!loading && fotos.length === 0 && (
                <div className="text-center py-12">
                  <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-default-300" />
                  <p className="text-default-500">Nenhuma foto adicionada</p>
                  <p className="text-xs text-default-400 mt-2">
                    Clique no botão acima para adicionar fotos desta OS
                  </p>
                </div>
              )}

              {!loading && fotos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">
                    Todas as Fotos ({fotos.length}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative group border-2 border-default-200 rounded-lg overflow-hidden hover:border-primary transition-all"
                      >
                        {/* Imagem */}
                        <div
                          className="aspect-square bg-default-100 cursor-pointer"
                          onClick={() => setFotoSelecionada(foto.url)}
                        >
                          <img
                            src={foto.url}
                            alt={`Foto ${foto.ordem + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Badge Principal */}
                        {foto.is_principal && (
                          <Chip
                            size="sm"
                            color="warning"
                            variant="solid"
                            className="absolute top-2 left-2"
                            startContent={<StarSolid className="w-3 h-3" />}
                          >
                            Principal
                          </Chip>
                        )}

                        {/* Ações (aparecem no hover) */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!foto.is_principal && (
                            <Button
                              isIconOnly
                              size="sm"
                              color="warning"
                              variant="solid"
                              onPress={() => handleSetPrincipal(foto.id)}
                            >
                              <StarOutline className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="solid"
                            onPress={() => handleDelete(foto.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Carrossel de Fotos */}
      {fotoSelecionada && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFotoSelecionada(null)}
        >
          <Button
            isIconOnly
            className="absolute top-4 right-4 z-10"
            variant="light"
            onPress={() => setFotoSelecionada(null)}
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </Button>
          <img
            src={fotoSelecionada}
            alt="Foto ampliada"
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, fotoId: "" })}
        onConfirm={confirmarDelete}
        title="Excluir Foto"
        message="Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="danger"
      />

      {toast.ToastComponent}
    </>
  );
}
