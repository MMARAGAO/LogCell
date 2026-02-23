"use client";

import type { Aparelho, TipoDevolucaoAparelho } from "@/types/aparelhos";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { PackageX, RefreshCcw, ShieldCheck } from "lucide-react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { DevolucoesAparelhosService } from "@/services/devolucoesAparelhosService";

interface ModalDevolucaoAparelhoProps {
  isOpen: boolean;
  aparelho: Aparelho;
  lojaId: number;
  lojaNome?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TIPOS: Array<{ value: TipoDevolucaoAparelho; label: string }> = [
  { value: "devolucao", label: "Devolucao" },
  { value: "troca", label: "Troca" },
  { value: "garantia", label: "Garantia" },
];

export function ModalDevolucaoAparelho({
  isOpen,
  aparelho,
  lojaId,
  lojaNome,
  onClose,
  onSuccess,
}: ModalDevolucaoAparelhoProps) {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();

  const [tipo, setTipo] = useState<TipoDevolucaoAparelho>("devolucao");
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTipo("devolucao");
      setMotivo("");
      setObservacoes("");
      setDataOcorrencia(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!usuario) return;

    if (!motivo.trim()) {
      showToast("Informe o motivo", "error");

      return;
    }

    setLoading(true);
    try {
      await DevolucoesAparelhosService.registrarDevolucaoAparelho({
        aparelho_id: aparelho.id,
        venda_id: aparelho.venda_id || null,
        loja_id: lojaId,
        tipo,
        motivo: motivo.trim(),
        observacoes: observacoes.trim() || null,
        data_ocorrencia: dataOcorrencia
          ? new Date(`${dataOcorrencia}T00:00:00`).toISOString()
          : undefined,
        usuario_id: usuario.id,
      });

      showToast("Registro salvo com sucesso", "success");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      showToast(error.message || "Erro ao registrar", "error");
    } finally {
      setLoading(false);
    }
  };

  const exibirAviso = tipo === "devolucao" || tipo === "troca";

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PackageX className="w-5 h-5 text-danger" />
            <span>Registrar Devolucao / Troca / Garantia</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            {aparelho.marca} {aparelho.modelo} - {aparelho.armazenamento}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card>
              <CardBody className="gap-2">
                <div className="text-sm text-default-500">Loja</div>
                <div className="text-sm font-medium">
                  {lojaNome || `Loja ${lojaId}`}
                </div>
              </CardBody>
            </Card>

            <Select
              label="Tipo"
              selectedKeys={[tipo]}
              onChange={(e) => setTipo(e.target.value as TipoDevolucaoAparelho)}
            >
              {TIPOS.map((opcao) => (
                <SelectItem key={opcao.value}>{opcao.label}</SelectItem>
              ))}
            </Select>

            {exibirAviso ? (
              <Card className="border border-warning/40">
                <CardBody className="flex items-start gap-3">
                  <RefreshCcw className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium">
                      O aparelho voltara para o estoque como disponivel.
                    </p>
                    <div className="mt-1">
                      <Chip color="warning" size="sm" variant="flat">
                        Estoque atualizado automaticamente
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="border border-success/40">
                <CardBody className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm font-medium">
                      Garantia registrada sem alterar o estoque.
                    </p>
                    <div className="mt-1">
                      <Chip color="success" size="sm" variant="flat">
                        Sem impacto financeiro
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <Input
              label="Data"
              type="date"
              value={dataOcorrencia}
              onValueChange={setDataOcorrencia}
            />

            <Textarea
              isRequired
              label="Motivo"
              placeholder="Descreva o motivo"
              value={motivo}
              onValueChange={setMotivo}
            />

            <Textarea
              label="Observacoes"
              placeholder="Informacoes adicionais (opcional)"
              value={observacoes}
              onValueChange={setObservacoes}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={loading} variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
