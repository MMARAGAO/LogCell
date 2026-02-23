"use client";

import type { Cliente } from "@/types/clientesTecnicos";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  Pagination,
} from "@heroui/react";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { usePermissoes } from "@/hooks/usePermissoes";
import { Permissao } from "@/components/Permissao";
import {
  ClienteFormModal,
  ClienteCard,
  GerenciarCreditosModal,
} from "@/components/clientes";
import {
  buscarClientes,
  deletarCliente,
  toggleClienteAtivo,
} from "@/services/clienteService";

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ClientesPage() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | undefined>();

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0);
  const [pageSize] = useState(50);

  // Estado para créditos
  const [creditosPorCliente, setCreditosPorCliente] = useState<
    Record<string, number>
  >({});
  const [modalCreditosOpen, setModalCreditosOpen] = useState(false);
  const [clienteCreditos, setClienteCreditos] = useState<{
    id: string;
    nome: string;
    saldo: number;
  } | null>(null);

  // Estado para modal de confirmação de exclusão
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<Cliente | null>(
    null,
  );

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | undefined>(
    undefined,
  );

  // Debounce da busca (500ms)
  const buscaDebounced = useDebounce(busca, 500);

  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  useEffect(() => {
    carregarClientes();
    carregarCreditos();
  }, [filtroAtivo, page, buscaDebounced]);

  const carregarClientes = async () => {
    setLoading(true);

    const {
      data,
      error,
      count,
      totalPages: total,
    } = await buscarClientes({
      ativo: filtroAtivo,
      busca: buscaDebounced || undefined,
      page,
      pageSize,
    });

    if (data) {
      setClientes(data);
      setTotalClientes(count);
      setTotalPages(total);

      // Calcular estatísticas totais (precisamos buscar sem filtro para stats corretas)
      if (!filtroAtivo && !busca) {
        calcularEstatisticas(count);
      }
    } else if (error) {
      toast.error(error);
    }

    setLoading(false);
  };

  const calcularEstatisticas = (total: number) => {
    // Para estatísticas completas, fazer queries separadas
    Promise.all([
      buscarClientes({ ativo: true, page: 1, pageSize: 1 }),
      buscarClientes({ ativo: false, page: 1, pageSize: 1 }),
    ]).then(([ativos, inativos]) => {
      setStats({
        total: total,
        ativos: ativos.count,
        inativos: inativos.count,
      });
    });
  };

  const carregarCreditos = async () => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data, error } = await supabase
        .from("creditos_cliente")
        .select("cliente_id, saldo")
        .gt("saldo", 0);

      if (error) throw error;

      // Agrupa créditos por cliente
      const creditosMap: Record<string, number> = {};

      (data || []).forEach((credito: any) => {
        if (!creditosMap[credito.cliente_id]) {
          creditosMap[credito.cliente_id] = 0;
        }
        creditosMap[credito.cliente_id] += credito.saldo;
      });

      setCreditosPorCliente(creditosMap);
    } catch (error) {
      console.error("Erro ao carregar créditos:", error);
    }
  };

  const handleNovoCliente = () => {
    if (!temPermissao("clientes.criar")) {
      toast.error("Você não tem permissão para criar clientes");

      return;
    }
    setClienteEditando(undefined);
    setModalOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    if (!temPermissao("clientes.editar")) {
      toast.error("Você não tem permissão para editar clientes");

      return;
    }
    setClienteEditando(cliente);
    setModalOpen(true);
  };

  const handleDeletarCliente = (cliente: Cliente) => {
    if (!temPermissao("clientes.deletar")) {
      toast.error("Você não tem permissão para excluir clientes");

      return;
    }
    setClienteParaDeletar(cliente);
    setModalDeleteOpen(true);
  };

  const confirmarDeletarCliente = async () => {
    if (!clienteParaDeletar) return;

    const { error } = await deletarCliente(clienteParaDeletar.id);

    if (error) {
      toast.error(error);
      setModalDeleteOpen(false);
      setClienteParaDeletar(null);

      return;
    }

    toast.success("Cliente excluído com sucesso!");
    setModalDeleteOpen(false);
    setClienteParaDeletar(null);
    carregarClientes();
  };

  const handleToggleAtivo = async (cliente: Cliente) => {
    if (!usuario) return;

    const { error } = await toggleClienteAtivo(
      cliente.id,
      !cliente.ativo,
      usuario.id,
    );

    if (error) {
      toast.error(error);

      return;
    }

    toast.success(
      cliente.ativo
        ? "Cliente desativado com sucesso!"
        : "Cliente ativado com sucesso!",
    );
    carregarClientes();
  };

  const handleVerHistorico = (cliente: Cliente) => {
    // TODO: Implementar modal de histórico
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleGerenciarCreditos = (cliente: Cliente) => {
    if (!temPermissao("clientes.processar_creditos")) {
      toast.error("Você não tem permissão para processar créditos");

      return;
    }
    setClienteCreditos({
      id: cliente.id,
      nome: cliente.nome,
      saldo: creditosPorCliente[cliente.id] || 0,
    });
    setModalCreditosOpen(true);
  };

  // Resetar para página 1 quando mudar busca ou filtro
  useEffect(() => {
    setPage(1);
  }, [buscaDebounced, filtroAtivo]);

  // Verificar estados de loading primeiro
  if (!usuario || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Verificar se tem permissão para visualizar clientes
  if (!temPermissao("clientes.visualizar")) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card>
          <CardBody className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-danger" />
            <h3 className="text-xl font-semibold mb-2">Acesso Negado</h3>
            <p className="text-default-500">
              Você não tem permissão para visualizar clientes
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {toast.ToastComponent}
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-default-500 mt-1">
            Gerencie o cadastro de clientes
          </p>
        </div>
        <Permissao permissao="clientes.criar">
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleNovoCliente}
          >
            Novo Cliente
          </Button>
        </Permissao>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          isPressable
          className={filtroAtivo === undefined ? "ring-2 ring-primary" : ""}
          onPress={() => setFiltroAtivo(undefined)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-default-100 rounded-lg">
              <Users className="w-6 h-6 text-default-600" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          className={filtroAtivo === true ? "ring-2 ring-success" : ""}
          onPress={() => setFiltroAtivo(true)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500">Ativos</p>
              <p className="text-2xl font-bold text-success">{stats.ativos}</p>
            </div>
          </CardBody>
        </Card>

        <Card
          isPressable
          className={filtroAtivo === false ? "ring-2 ring-danger" : ""}
          onPress={() => setFiltroAtivo(false)}
        >
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-3 bg-danger-100 rounded-lg">
              <UserX className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-sm text-default-500">Inativos</p>
              <p className="text-2xl font-bold text-danger">{stats.inativos}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardBody>
          <Input
            isClearable
            description={
              busca !== buscaDebounced
                ? "Aguardando digitação..."
                : totalClientes > 0
                  ? `${totalClientes} cliente${totalClientes !== 1 ? "s" : ""} encontrado${totalClientes !== 1 ? "s" : ""}`
                  : undefined
            }
            placeholder="Buscar por nome, telefone, CPF ou email..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onClear={() => setBusca("")}
          />
        </CardBody>
      </Card>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : clientes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-default-300" />
            <h3 className="text-xl font-semibold mb-2">
              {totalClientes === 0
                ? "Nenhum cliente cadastrado"
                : "Nenhum cliente encontrado"}
            </h3>
            <p className="text-default-500 mb-6">
              {totalClientes === 0
                ? "Cadastre seu primeiro cliente clicando no botão acima"
                : "Tente ajustar os filtros de busca"}
            </p>
            {totalClientes === 0 && (
              <Permissao permissao="clientes.criar">
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleNovoCliente}
                >
                  Novo Cliente
                </Button>
              </Permissao>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                creditosDisponiveis={creditosPorCliente[cliente.id] || 0}
                onDeletar={handleDeletarCliente}
                onEditar={handleEditarCliente}
                onGerenciarCreditos={handleGerenciarCreditos}
                onToggleAtivo={handleToggleAtivo}
                onVerHistorico={handleVerHistorico}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <Pagination
                showControls
                color="primary"
                page={page}
                size="lg"
                total={totalPages}
                onChange={setPage}
              />
              <p className="text-sm text-default-500">
                Mostrando{" "}
                <span className="font-semibold">
                  {(page - 1) * pageSize + 1}
                </span>
                {" - "}
                <span className="font-semibold">
                  {Math.min(page * pageSize, totalClientes)}
                </span>
                {" de "}
                <span className="font-semibold">{totalClientes}</span> clientes
                {(buscaDebounced || filtroAtivo !== undefined) && (
                  <span className="text-primary"> (filtrados)</span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal de Criar/Editar Cliente */}
      <ClienteFormModal
        cliente={clienteEditando}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteEditando(undefined);
        }}
        onSuccess={carregarClientes}
      />

      {/* Modal de Gerenciar Créditos */}
      {clienteCreditos && (
        <GerenciarCreditosModal
          clienteId={clienteCreditos.id}
          clienteNome={clienteCreditos.nome}
          isOpen={modalCreditosOpen}
          saldoAtual={clienteCreditos.saldo}
          onClose={() => {
            setModalCreditosOpen(false);
            setClienteCreditos(null);
          }}
          onSuccess={() => {
            carregarCreditos();
            carregarClientes();
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmColor="danger"
        confirmText="Excluir"
        isOpen={modalDeleteOpen}
        message={
          clienteParaDeletar ? (
            <p>
              Deseja realmente excluir o cliente{" "}
              <strong>{clienteParaDeletar.nome}</strong>?
              <br />
              <br />
              Esta ação não poderá ser desfeita.
            </p>
          ) : (
            ""
          )
        }
        title="Excluir Cliente"
        onClose={() => {
          setModalDeleteOpen(false);
          setClienteParaDeletar(null);
        }}
        onConfirm={confirmarDeletarCliente}
      />
    </div>
  );
}
