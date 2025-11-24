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
import { Divider } from "@heroui/divider";
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Loja, LojaFoto } from "@/types";
import { cadastrarLoja, atualizarLoja } from "@/app/sistema/lojas/actions";
import { LojasFotosService } from "@/services/lojasFotosService";
import {
  cadastrarFoto,
  deletarFoto,
  definirFotoPrincipal,
} from "@/app/sistema/lojas/actions/fotos";
import { CarrosselFotos } from "@/components/CarrosselFotos";

interface LojaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  loja: Loja | null;
  onSuccess: () => void;
  usuarioId: string;
}

export function LojaFormModal({
  isOpen,
  onClose,
  loja,
  onSuccess,
  usuarioId,
}: LojaFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<LojaFoto[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  useEffect(() => {
    // Só executar quando o modal estiver aberto
    if (!isOpen) return;

    if (loja) {
      setFormData({
        nome: loja.nome,
        cnpj: loja.cnpj || "",
        telefone: loja.telefone || "",
        email: loja.email || "",
        endereco: loja.endereco || "",
        cidade: loja.cidade || "",
        estado: loja.estado || "",
        cep: loja.cep || "",
      });
      // Carregar fotos se estiver editando
      carregarFotos(loja.id);
    } else {
      setFormData({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
      });
      setFotos([]);
    }
    setError(null);
    setLoading(false);
    setUploading(false);
  }, [loja, isOpen]);

  async function carregarFotos(lojaId: number) {
    setLoadingFotos(true);
    try {
      const data = await LojasFotosService.getFotosPorLoja(lojaId);
      setFotos(data);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoadingFotos(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!loja) {
      setError("Salve a loja primeiro antes de adicionar fotos");
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload para o Storage
        const { url, error: uploadError } = await LojasFotosService.uploadFoto(
          loja.id,
          file
        );

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          setError(uploadError);
          continue;
        }

        // Cadastrar no banco de dados
        const result = await cadastrarFoto({
          loja_id: loja.id,
          url,
          ordem: fotos.length + i,
          is_principal: fotos.length === 0 && i === 0,
        });

        if (!result.success) {
          console.error("Erro ao cadastrar foto:", result.error);
          setError(result.error || "Erro ao cadastrar foto");
        }
      }

      // Recarregar fotos
      await carregarFotos(loja.id);
    } catch (error) {
      console.error("Erro no processo de upload:", error);
      setError("Erro inesperado no upload de fotos");
    } finally {
      setUploading(false);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDefinirPrincipal(foto: LojaFoto) {
    if (!loja) return;

    try {
      const result = await definirFotoPrincipal(foto.id);
      if (result.success) {
        await carregarFotos(loja.id);
      } else {
        setError(result.error || "Erro ao definir foto principal");
      }
    } catch (error) {
      console.error("Erro ao definir foto principal:", error);
      setError("Erro inesperado ao definir foto principal");
    }
  }

  async function handleDeletarFoto(foto: LojaFoto) {
    if (!loja) return;

    try {
      const result = await deletarFoto(foto.id);
      if (result.success) {
        await LojasFotosService.deletarFotoStorage(foto.url);
        await carregarFotos(loja.id);
      } else {
        setError(result.error || "Erro ao deletar foto");
      }
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      setError("Erro inesperado ao deletar foto");
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2");
      }
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleChange("cnpj", formatted);
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatTelefone(value);
    handleChange("telefone", formatted);
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    handleChange("cep", formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome.trim()) {
      setError("Nome da loja é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const dados = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        email: formData.email.trim() || undefined,
        endereco: formData.endereco.trim() || undefined,
        cidade: formData.cidade.trim() || undefined,
        estado: formData.estado.trim() || undefined,
        cep: formData.cep.trim() || undefined,
      };

      const result = loja
        ? await atualizarLoja(loja.id, dados, usuarioId)
        : await cadastrarLoja(dados, usuarioId);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao salvar loja");
      }
    } catch (err) {
      console.error("❌ [LojaFormModal] Erro ao salvar loja:", err);
      setError("Erro inesperado ao salvar loja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{loja ? "Editar Loja" : "Nova Loja"}</ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* Dica sobre fotos (apenas ao criar) */}
              {!loja && (
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-2">
                  <PhotoIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-primary font-medium">Dica</p>
                    <p className="text-xs text-primary-700 mt-1">
                      Após criar a loja, você poderá adicionar fotos editando-a
                      novamente.
                    </p>
                  </div>
                </div>
              )}

              {/* Seção: Dados da Loja */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Dados da Loja
                </h3>

                {/* Nome */}
                <Input
                  label="Nome da Loja"
                  placeholder="Ex: Filial Centro"
                  value={formData.nome}
                  onValueChange={(value) => handleChange("nome", value)}
                  isRequired
                  isDisabled={loading}
                />

                {/* CNPJ */}
                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onValueChange={handleCNPJChange}
                  maxLength={18}
                  isDisabled={loading}
                />

                {/* Telefone e Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onValueChange={handleTelefoneChange}
                    maxLength={15}
                    isDisabled={loading}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="loja@exemplo.com"
                    value={formData.email}
                    onValueChange={(value) => handleChange("email", value)}
                    isDisabled={loading}
                  />
                </div>

                {/* Endereço */}
                <Input
                  label="Endereço"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onValueChange={(value) => handleChange("endereco", value)}
                  isDisabled={loading}
                />

                {/* Cidade, Estado e CEP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Cidade"
                    placeholder="Ex: São Paulo"
                    value={formData.cidade}
                    onValueChange={(value) => handleChange("cidade", value)}
                    isDisabled={loading}
                  />
                  <Input
                    label="Estado"
                    placeholder="Ex: SP"
                    value={formData.estado}
                    onValueChange={(value) =>
                      handleChange("estado", value.toUpperCase())
                    }
                    maxLength={2}
                    isDisabled={loading}
                  />
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.cep}
                    onValueChange={handleCEPChange}
                    maxLength={9}
                    isDisabled={loading}
                  />
                </div>
              </div>

              {/* Seção: Fotos (apenas ao editar) */}
              {loja && (
                <>
                  <Divider className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Fotos da Loja
                      </h3>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<PlusIcon className="w-4 h-4" />}
                        onPress={() => fileInputRef.current?.click()}
                        isLoading={uploading}
                      >
                        {uploading ? "Enviando..." : "Adicionar Fotos"}
                      </Button>
                    </div>

                    {fotos.length > 0 ? (
                      <div className="space-y-4">
                        {/* Carrossel */}
                        <CarrosselFotos
                          fotos={fotos.map((f) => ({
                            id: f.id,
                            url: f.url,
                            legenda: f.legenda,
                          }))}
                          height="300px"
                          showThumbnails={true}
                          showLegendas={false}
                        />

                        {/* Lista de fotos */}
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">
                            {fotos.length}{" "}
                            {fotos.length === 1 ? "foto" : "fotos"}{" "}
                            cadastrada(s)
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {fotos.map((foto) => (
                              <div
                                key={foto.id}
                                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
                              >
                                <Image
                                  src={foto.url}
                                  alt={foto.legenda || "Foto"}
                                  fill
                                  className="object-cover"
                                />

                                {/* Overlay com ações */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color={
                                      foto.is_principal ? "warning" : "default"
                                    }
                                    variant="flat"
                                    onPress={() => handleDefinirPrincipal(foto)}
                                    title="Definir como principal"
                                  >
                                    {foto.is_principal ? (
                                      <StarIconSolid className="w-4 h-4" />
                                    ) : (
                                      <StarIcon className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    onPress={() => handleDeletarFoto(foto)}
                                    title="Deletar"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Badge de principal */}
                                {foto.is_principal && (
                                  <div className="absolute top-1 left-1">
                                    <div className="bg-warning text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <StarIconSolid className="w-3 h-3" />
                                      Principal
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          Nenhuma foto adicionada
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Clique em "Adicionar Fotos" para começar
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={loading}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              {loja ? "Atualizar" : "Cadastrar"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
