"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Input, useDisclosure, Button } from "@heroui/react";
import { Wrench, Search, Users, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useSearchParams } from "next/navigation";
import {
  buscarTecnicos,
  deletarTecnico,
  toggleTecnicoAtivo,
} from "@/services/tecnicoService";
import { TecnicoCard, TecnicoComLoginModal } from "@/components/tecnicos";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Tecnico } from "@/types/clientesTecnicos";

export default function TecnicosPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  const {
    isOpen: isLoginModalOpen,
    onOpen: onLoginModalOpen,
    onClose: onLoginModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | undefined>(
    undefined
  );
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [tecnicoParaDeletar, setTecnicoParaDeletar] = useState<Tecnico | null>(
    null
  );

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  useEffect(() => {
    carregarTecnicos();
  }, [filtroAtivo, busca]);

  const carregarTecnicos = async () => {
    setLoading(true);
    const { data, error } = await buscarTecnicos({
      ativo: filtroAtivo,
      busca: busca || undefined,
      idLoja: undefined,
    });

    if (error) {
      toast.error(error);
    } else {
      setTecnicos(data || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (tecnico: Tecnico) => {
    if (!usuario) return;

    if (!temPermissao("tecnicos.editar")) {
      toast.error("Você não tem permissão para alterar o status de técnicos");
      return;
    }

    const { error } = await toggleTecnicoAtivo(
      tecnico.id,
      !tecnico.ativo,
      usuario.id
    );
    if (error) {
      toast.error(error);
    } else {
      toast.success(
        `Técnico ${tecnico.ativo ? "desativado" : "ativado"} com sucesso!`
      );
      carregarTecnicos();
    }
  };

  const handleDeleteConfirm = (tecnico: Tecnico) => {
    setTecnicoParaDeletar(tecnico);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!tecnicoParaDeletar) return;

    if (!temPermissao("tecnicos.deletar")) {
      toast.error("Você não tem permissão para deletar técnicos");
      onDeleteClose();
      return;
    }

    const { error } = await deletarTecnico(tecnicoParaDeletar.id);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Técnico excluído com sucesso!");
      carregarTecnicos();
    }
    onDeleteClose();
  };

  const tecnicosAtivos = tecnicos.filter((t) => t.ativo).length;
  const tecnicosInativos = tecnicos.filter((t) => !t.ativo).length;

  const getMenuItems = (tecnico: Tecnico) => {
    const items: Array<{
      key: string;
      label: string;
      icon: string;
      onClick: () => void;
      show: boolean;
      color?: "danger" | "default";
    }> = [
      {
        key: "os",
        label: "Ver OS",
        icon: "history",
        onClick: () => toast.info("Funcionalidade em desenvolvimento"),
        show: true,
      },
    ];

    if (temPermissao("tecnicos.editar")) {
      items.push({
        key: "toggle",
        label: tecnico.ativo ? "Desativar" : "Ativar",
        icon: "toggle",
        onClick: () => handleToggleStatus(tecnico),
        show: true,
      });
    }

    if (temPermissao("tecnicos.deletar")) {
      items.push({
        key: "delete",
        label: "Excluir",
        icon: "delete",
        onClick: () => handleDeleteConfirm(tecnico),
        show: true,
        color: "danger" as const,
      });
    }

    return items.filter((item) => item.show);
  };

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("tecnicos.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar técnicos.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Técnicos
          </h1>
          <p className="text-default-500 text-sm">
            Gerencie os técnicos com acesso ao sistema
          </p>
        </div>
        {temPermissao("tecnicos.criar") && (
          <Button
            color="primary"
            size="lg"
            startContent={<UserPlus className="w-5 h-5" />}
            onPress={onLoginModalOpen}
          >
            Novo Técnico
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          isPressable
          onPress={() => setFiltroAtivo(undefined)}
          className={filtroAtivo === undefined ? "border-2 border-primary" : ""}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Total de Técnicos</p>
            <p className="text-3xl font-bold">{tecnicos.length}</p>
          </CardBody>
        </Card>
        <Card
          isPressable
          onPress={() => setFiltroAtivo(true)}
          className={filtroAtivo === true ? "border-2 border-success" : ""}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Ativos</p>
            <p className="text-3xl font-bold text-success">{tecnicosAtivos}</p>
          </CardBody>
        </Card>
        <Card
          isPressable
          onPress={() => setFiltroAtivo(false)}
          className={filtroAtivo === false ? "border-2 border-danger" : ""}
        >
          <CardBody className="text-center">
            <p className="text-default-500 text-sm">Inativos</p>
            <p className="text-3xl font-bold text-danger">{tecnicosInativos}</p>
          </CardBody>
        </Card>
      </div>

      <Input
        placeholder="Buscar por nome, telefone ou e-mail..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        startContent={<Search className="w-4 h-4" />}
        isClearable
        onClear={() => setBusca("")}
      />

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : tecnicos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-default-300 mb-4" />
          <p className="text-default-500">Nenhum técnico encontrado</p>
          {temPermissao("tecnicos.criar") && (
            <button
              onClick={onLoginModalOpen}
              className="mt-4 text-primary hover:underline"
            >
              Cadastrar primeiro técnico
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tecnicos.map((tecnico) => (
            <TecnicoCard
              key={tecnico.id}
              tecnico={tecnico}
              menuItems={getMenuItems(tecnico)}
            />
          ))}
        </div>
      )}

      <TecnicoComLoginModal
        isOpen={isLoginModalOpen}
        onClose={onLoginModalClose}
        onSuccess={carregarTecnicos}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Excluir Técnico"
        message={`Tem certeza que deseja excluir o técnico ${tecnicoParaDeletar?.nome}?`}
      />
    </div>
  );
}
