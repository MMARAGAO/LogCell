"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Package,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  User,
  Phone,
  Smartphone,
  Calendar,
  DollarSign,
  Camera,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  OrdemServico,
  STATUS_OS_LABELS,
  STATUS_OS_COLORS,
  PRIORIDADE_OS_LABELS,
  PRIORIDADE_OS_COLORS,
} from "@/types/ordemServico";
import { useState, useEffect } from "react";
import MiniCarrossel from "@/components/MiniCarrossel";

interface OrdemServicoCardProps {
  os: OrdemServico;
  onVisualizar: (os: OrdemServico) => void;
  onEditar: (os: OrdemServico) => void;
  onDeletar: (os: OrdemServico) => void;
  onCancelar?: (os: OrdemServico) => void;
  onGerenciarPecas: (os: OrdemServico) => void;
  onVerHistorico: (os: OrdemServico) => void;
  onGerenciarFotos?: (os: OrdemServico) => void;
  onGerenciarPagamentos?: (os: OrdemServico) => void;
  onAssumirOS?: (os: OrdemServico) => void;
}

export default function OrdemServicoCard({
  os,
  onVisualizar,
  onEditar,
  onDeletar,
  onCancelar,
  onGerenciarPecas,
  onVerHistorico,
  onGerenciarFotos,
  onGerenciarPagamentos,
  onAssumirOS,
}: OrdemServicoCardProps) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [loadingFotos, setLoadingFotos] = useState(false);

  useEffect(() => {
    carregarFotos();
  }, [os.id]);

  const carregarFotos = async () => {
    setLoadingFotos(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_fotos")
        .select("url, ordem, is_principal")
        .eq("id_ordem_servico", os.id)
        .order("is_principal", { ascending: false })
        .order("ordem", { ascending: true })
        .limit(5);

      if (error) throw error;

      if (data) {
        setFotos(data.map((f) => f.url));
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    } finally {
      setLoadingFotos(false);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const calcularSaldoPendente = () => {
    const total = os.valor_total || 0;
    const pago = os.valor_pago || 0;
    return total - pago;
  };

  const getAlertas = () => {
    const alertas = [];

    // Verificar pagamento pendente
    if (os.valor_total && os.valor_total > 0) {
      const saldo = calcularSaldoPendente();
      if (saldo > 0) {
        alertas.push({
          tipo: "pagamento",
          mensagem: `Falta pagar R$ ${saldo.toFixed(2)}`,
          cor: "warning",
          icone: DollarSign,
        });
      }
    }

    // Verificar se está concluído mas não tem laudo
    if (os.status === "concluido" && !os.laudo_diagnostico) {
      alertas.push({
        tipo: "laudo",
        mensagem: "Laudo técnico não preenchido",
        cor: "warning",
        icone: FileText,
      });
    }

    // Verificar se não tem técnico responsável
    if (
      !os.tecnico_responsavel &&
      os.status !== "aguardando" &&
      os.status !== "cancelado"
    ) {
      alertas.push({
        tipo: "tecnico",
        mensagem: "Sem técnico responsável",
        cor: "danger",
        icone: AlertTriangle,
      });
    }

    // Verificar se está pronto para entrega (concluído e pago)
    if (os.status === "concluido" && calcularSaldoPendente() === 0) {
      alertas.push({
        tipo: "pronto",
        mensagem: "Pronto para entrega",
        cor: "success",
        icone: CheckCircle,
      });
    }

    return alertas;
  };

  const alertas = getAlertas();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        {/* Mini Carrossel de Fotos ou Placeholder */}
        {fotos.length > 0 ? (
          <div className="mb-3 -mx-4 -mt-4">
            <MiniCarrossel images={fotos} aspectRatio="video" />
          </div>
        ) : (
          <div className="mb-3 -mx-4 -mt-4 bg-default-100 flex items-center justify-center aspect-video">
            <div className="text-center">
              <Camera className="w-12 h-12 text-default-300 mx-auto mb-2" />
              <p className="text-sm text-default-400">Sem fotos</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-primary">
                OS #{os.numero_os}
              </h3>
              <Chip
                size="sm"
                color={STATUS_OS_COLORS[os.status]}
                variant="flat"
              >
                {STATUS_OS_LABELS[os.status]}
              </Chip>
              <Chip
                size="sm"
                color={PRIORIDADE_OS_COLORS[os.prioridade]}
                variant="dot"
              >
                {PRIORIDADE_OS_LABELS[os.prioridade]}
              </Chip>
            </div>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações da OS">
              <DropdownItem
                key="assumir"
                startContent={<User className="w-4 h-4" />}
                onPress={() => onAssumirOS?.(os)}
                color="primary"
                className={os.tecnico_responsavel ? "opacity-50" : ""}
                description={
                  os.tecnico_responsavel
                    ? "Já atribuída a um técnico"
                    : "Assumir responsabilidade"
                }
                isDisabled={!onAssumirOS}
              >
                {os.tecnico_responsavel ? "Já Atribuída" : "Assumir OS"}
              </DropdownItem>
              <DropdownItem
                key="visualizar"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => onVisualizar(os)}
              >
                Visualizar
              </DropdownItem>
              <DropdownItem
                key="editar"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => onEditar(os)}
              >
                Editar
              </DropdownItem>
              <DropdownItem
                key="pecas"
                startContent={<Package className="w-4 h-4" />}
                onPress={() => onGerenciarPecas(os)}
                color="secondary"
              >
                Gerenciar Peças
              </DropdownItem>
              <DropdownItem
                key="fotos"
                startContent={<Camera className="w-4 h-4" />}
                onPress={() => onGerenciarFotos?.(os)}
                color="secondary"
              >
                Gerenciar Fotos
              </DropdownItem>
              <DropdownItem
                key="pagamentos"
                startContent={<DollarSign className="w-4 h-4" />}
                onPress={() => onGerenciarPagamentos?.(os)}
                color="success"
              >
                Pagamentos
              </DropdownItem>
              <DropdownItem
                key="historico"
                startContent={<Clock className="w-4 h-4" />}
                onPress={() => onVerHistorico(os)}
              >
                Ver Histórico
              </DropdownItem>
              {onCancelar &&
              os.status !== "cancelado" &&
              os.status !== "entregue" ? (
                <DropdownItem
                  key="cancelar"
                  startContent={<AlertTriangle className="w-4 h-4" />}
                  color="warning"
                  className="text-warning"
                  onPress={() => onCancelar(os)}
                >
                  Cancelar OS
                </DropdownItem>
              ) : null}
              {os.status === "cancelado" ? (
                <DropdownItem
                  key="deletar"
                  startContent={<Trash2 className="w-4 h-4" />}
                  color="danger"
                  className="text-danger"
                  onPress={() => onDeletar(os)}
                >
                  Excluir
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Cliente */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-default-400" />
            <span className="font-medium">{os.cliente_nome}</span>
            {os.tipo_cliente && (
              <Chip
                size="sm"
                color={os.tipo_cliente === "lojista" ? "primary" : "secondary"}
                variant="flat"
              >
                {os.tipo_cliente === "lojista" ? "Lojista" : "Consumidor"}
              </Chip>
            )}
          </div>

          {os.cliente_telefone && (
            <div className="flex items-center gap-2 text-sm text-default-600">
              <Phone className="w-4 h-4 text-default-400" />
              <span>{os.cliente_telefone}</span>
            </div>
          )}
        </div>

        {/* Equipamento */}
        <div className="bg-default-100 dark:bg-default-100/10 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-default-500" />
            <span className="text-sm font-medium">
              {os.equipamento_tipo}
              {os.equipamento_marca && ` - ${os.equipamento_marca}`}
              {os.equipamento_modelo && ` ${os.equipamento_modelo}`}
            </span>
          </div>
          <p className="text-xs text-default-600 line-clamp-2 mt-1">
            {os.defeito_reclamado}
          </p>
        </div>

        {/* Alertas - O que está faltando */}
        {alertas.length > 0 && (
          <div className="space-y-2 mb-3">
            {alertas.map((alerta, index) => {
              const Icon = alerta.icone;
              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                    ${alerta.cor === "warning" ? "bg-warning-50 dark:bg-warning-900/20 text-warning" : ""}
                    ${alerta.cor === "danger" ? "bg-danger-50 dark:bg-danger-900/20 text-danger" : ""}
                    ${alerta.cor === "success" ? "bg-success-50 dark:bg-success-900/20 text-success" : ""}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{alerta.mensagem}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Informações de Data e Valor */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1 text-xs text-default-500 mb-1">
              <Calendar className="w-3 h-3" />
              <span>Entrada</span>
            </div>
            <p className="text-sm font-medium">
              {formatarData(os.data_entrada)}
            </p>
          </div>

          {os.previsao_entrega && (
            <div>
              <div className="flex items-center gap-1 text-xs text-default-500 mb-1">
                <Clock className="w-3 h-3" />
                <span>Previsão</span>
              </div>
              <p className="text-sm font-medium">
                {formatarData(os.previsao_entrega)}
              </p>
            </div>
          )}
        </div>

        {/* Valores */}
        {os.valor_total !== undefined && os.valor_total !== null && (
          <div className="border-t border-default-200 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-default-600">Valor Total:</span>
              <span className="text-sm font-bold">
                R$ {os.valor_total.toFixed(2)}
              </span>
            </div>

            {os.valor_pago !== undefined &&
              os.valor_pago !== null &&
              os.valor_pago > 0 && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-default-600">Pago:</span>
                    <span className="text-sm text-success">
                      R$ {(os.valor_pago || 0).toFixed(2)}
                    </span>
                  </div>

                  {calcularSaldoPendente() > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-600">
                        Pendente:
                      </span>
                      <span className="text-sm font-bold text-warning">
                        R$ {calcularSaldoPendente().toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-default-200">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => onVisualizar(os)}
            className="flex-1"
          >
            Ver Detalhes
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
