"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
} from "@heroui/react";
import { Gift } from "lucide-react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { BrindesAparelhosService } from "@/services/brindesAparelhosService";

interface ModalBrindeAparelhoProps {
  isOpen: boolean;
  lojaId: number;
  lojaNome?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalBrindeAparelho({
  isOpen,
  lojaId,
  lojaNome,
  onClose,
  onSuccess,
}: ModalBrindeAparelhoProps) {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();

  const [descricao, setDescricao] = useState("");
  const [valorCusto, setValorCusto] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescricao("");
      setValorCusto("");
      setDataOcorrencia(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!usuario) return;

    const valor = Number(valorCusto);

    if (!descricao.trim()) {
      showToast("Informe a descricao do brinde", "error");

      return;
    }

    if (!valor || valor <= 0) {
      showToast("Informe um valor valido", "error");

      return;
    }

    setLoading(true);
    try {
      await BrindesAparelhosService.registrarBrinde({
        loja_id: lojaId,
        descricao: descricao.trim(),
        valor_custo: valor,
        data_ocorrencia: dataOcorrencia
          ? new Date(`${dataOcorrencia}T00:00:00`).toISOString()
          : undefined,
        usuario_id: usuario.id,
      });

      showToast("Brinde registrado", "success");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao registrar brinde:", error);
      showToast(error.message || "Erro ao registrar brinde", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-secondary" />
          <span>Registrar Brinde</span>
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
            <Input
              isRequired
              label="Descricao"
              placeholder="Ex: pelicula, capa, acessorio"
              value={descricao}
              onValueChange={setDescricao}
            />
            <Input
              isRequired
              label="Valor de custo"
              placeholder="0,00"
              type="number"
              value={valorCusto}
              onValueChange={setValorCusto}
            />
            <Input
              label="Data"
              type="date"
              value={dataOcorrencia}
              onValueChange={setDataOcorrencia}
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
