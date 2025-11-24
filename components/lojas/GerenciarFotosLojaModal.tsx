"use client";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { LojasFotosService } from "@/services/lojasFotosService";
import type { LojaFoto } from "@/types";
import {
  cadastrarFoto,
  atualizarFoto,
  deletarFoto,
  definirFotoPrincipal,
  reordenarFotos,
} from "@/app/sistema/lojas/actions/fotos";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useDisclosure } from "@heroui/modal";
import { CarrosselFotos } from "@/components/CarrosselFotos";

interface GerenciarFotosLojaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lojaId: number;
  lojaNome: string;
}

export function GerenciarFotosLojaModal({
  isOpen,
  onClose,
  lojaId,
  lojaNome,
}: GerenciarFotosLojaModalProps) {
  const [fotos, setFotos] = useState<LojaFoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoParaDeletar, setFotoParaDeletar] = useState<LojaFoto | null>(null);
  const [editandoLegenda, setEditandoLegenda] = useState<number | null>(null);
  const [novaLegenda, setNovaLegenda] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  useEffect(() => {
    if (isOpen) {
      carregarFotos();
    } else {
      // Resetar estados ao fechar
      setLoading(false);
      setUploading(false);
      setEditandoLegenda(null);
      setFotoParaDeletar(null);
    }
  }, [isOpen, lojaId]);

  async function carregarFotos() {
    setLoading(true);
    try {
      const data = await LojasFotosService.getFotosPorLoja(lojaId);
      setFotos(data);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload para o Storage
        const { url, error } = await LojasFotosService.uploadFoto(lojaId, file);

        if (error) {
          console.error("Erro no upload:", error);
          continue;
        }

        // Cadastrar no banco de dados
        const result = await cadastrarFoto({
          loja_id: lojaId,
          url,
          ordem: fotos.length + i,
          is_principal: fotos.length === 0 && i === 0, // Primeira foto é principal
        });

        if (!result.success) {
          console.error("Erro ao cadastrar foto:", result.error);
        }
      }

      // Recarregar fotos
      await carregarFotos();
    } catch (error) {
      console.error("Erro no processo de upload:", error);
    } finally {
      setUploading(false);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDefinirPrincipal(foto: LojaFoto) {
    try {
      const result = await definirFotoPrincipal(foto.id);
      if (result.success) {
        await carregarFotos();
      } else {
        console.error("Erro ao definir foto principal:", result.error);
      }
    } catch (error) {
      console.error("Erro ao definir foto principal:", error);
    }
  }

  async function handleEditarLegenda(foto: LojaFoto) {
    setEditandoLegenda(foto.id);
    setNovaLegenda(foto.legenda || "");
  }

  async function handleSalvarLegenda(fotoId: number) {
    try {
      const result = await atualizarFoto(fotoId, { legenda: novaLegenda });
      if (result.success) {
        await carregarFotos();
        setEditandoLegenda(null);
      } else {
        console.error("Erro ao salvar legenda:", result.error);
      }
    } catch (error) {
      console.error("Erro ao salvar legenda:", error);
    }
  }

  async function handleDeletar(foto: LojaFoto) {
    setFotoParaDeletar(foto);
    onDeleteOpen();
  }

  async function confirmarDeletar() {
    if (!fotoParaDeletar) return;

    try {
      // Deletar do banco
      const result = await deletarFoto(fotoParaDeletar.id);

      if (result.success) {
        // Deletar do Storage
        await LojasFotosService.deletarFotoStorage(fotoParaDeletar.url);
        await carregarFotos();
      } else {
        console.error("Erro ao deletar foto:", result.error);
      }
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
    } finally {
      onDeleteClose();
      setFotoParaDeletar(null);
    }
  }

  const fotosParaCarrossel = fotos.map((foto) => ({
    id: foto.id,
    url: foto.url,
    legenda: foto.legenda,
  }));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <PhotoIcon className="w-5 h-5" />
            <div>
              <p className="text-lg">Gerenciar Fotos</p>
              <p className="text-sm font-normal text-gray-500">{lojaNome}</p>
            </div>
          </ModalHeader>

          <ModalBody>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner label="Carregando fotos..." />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview do Carrossel */}
                {fotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Preview do Carrossel
                      </h3>
                      <Button size="sm" variant="flat" onPress={onPreviewOpen}>
                        Ver em Tela Cheia
                      </Button>
                    </div>
                    <CarrosselFotos
                      fotos={fotosParaCarrossel}
                      height="300px"
                      showThumbnails={true}
                      showLegendas={true}
                    />
                  </div>
                )}

                {/* Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<PlusIcon className="w-5 h-5" />}
                    onPress={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                    fullWidth
                  >
                    {uploading ? "Enviando..." : "Adicionar Fotos"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos: JPG, PNG, WebP, GIF | Tamanho máximo: 5MB por foto
                  </p>
                </div>

                {/* Lista de Fotos */}
                {fotos.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Fotos Cadastradas ({fotos.length})
                    </h3>
                    {fotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={foto.url}
                            alt={foto.legenda || "Foto"}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {editandoLegenda === foto.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={novaLegenda}
                                onChange={(e) => setNovaLegenda(e.target.value)}
                                placeholder="Legenda da foto"
                                size="sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                color="primary"
                                onPress={() => handleSalvarLegenda(foto.id)}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                onPress={() => setEditandoLegenda(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p
                                className="text-sm font-medium text-gray-700 truncate cursor-pointer hover:text-primary"
                                onClick={() => handleEditarLegenda(foto)}
                              >
                                {foto.legenda ||
                                  "Sem legenda (clique para editar)"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  Ordem: {foto.ordem + 1}
                                </span>
                                {foto.is_principal && (
                                  <Chip
                                    color="warning"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Principal
                                  </Chip>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color={foto.is_principal ? "warning" : "default"}
                            onPress={() => handleDefinirPrincipal(foto)}
                            title="Definir como principal"
                          >
                            {foto.is_principal ? (
                              <StarIconSolid className="w-5 h-5" />
                            ) : (
                              <StarIcon className="w-5 h-5" />
                            )}
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDeletar(foto)}
                            title="Deletar foto"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Nenhuma foto cadastrada</p>
                    <p className="text-xs mt-1">
                      Clique em "Adicionar Fotos" para começar
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              startContent={<XMarkIcon className="w-4 h-4" />}
            >
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmarDeletar}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja deletar esta foto? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmColor="danger"
      />

      {/* Modal de Preview em Tela Cheia */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        size="full"
        hideCloseButton
      >
        <ModalContent>
          <ModalBody className="p-6">
            <div className="h-full">
              <CarrosselFotos
                fotos={fotosParaCarrossel}
                height="calc(100vh - 100px)"
                showThumbnails={true}
                showLegendas={true}
                autoPlay={false}
              />
            </div>
            <Button
              isIconOnly
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white"
              onPress={onPreviewClose}
              size="lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
