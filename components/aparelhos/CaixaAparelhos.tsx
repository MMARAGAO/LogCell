"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  DollarSign,
  TrendingUp,
  Smartphone,
  CreditCard,
  Repeat,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  CaixaAparelhosService,
  ResumoCaixaAparelhos,
} from "@/services/caixaAparelhosService";
import { formatarMoeda, formatarData } from "@/lib/formatters";

interface CaixaAparelhosProps {
  lojaId: number;
  inicialmenteExpandido?: boolean;
}

export function CaixaAparelhos({
  lojaId,
  inicialmenteExpandido = true,
}: CaixaAparelhosProps) {
  const [resumo, setResumo] = useState<ResumoCaixaAparelhos | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [expandido, setExpandido] = useState(inicialmenteExpandido);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);

  useEffect(() => {
    carregarResumo();
  }, [lojaId, dataInicio, dataFim]);

  const carregarResumo = async () => {
    setLoading(true);
    try {
      const data = await CaixaAparelhosService.buscarResumoCaixaAparelhos(
        lojaId,
        `${dataInicio}T00:00:00`,
        `${dataFim}T23:59:59`,
      );

      setResumo(data);
    } catch (error: any) {
      console.error("Erro ao carregar resumo:", error);
    } finally {
      setLoading(false);
    }
  };

  const margemLucro = resumo
    ? resumo.valor_total_vendas > 0
      ? (resumo.lucro_bruto / resumo.valor_total_vendas) * 100
      : 0
    : 0;

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Caixa de Aparelhos</h3>
            {dataInicio === dataFim &&
              dataInicio === new Date().toISOString().split("T")[0] && (
                <Chip color="success" size="sm" variant="flat">
                  Hoje
                </Chip>
              )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              isLoading={loading}
              size="sm"
              variant="light"
              onPress={carregarResumo}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {!inicialmenteExpandido && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setExpandido(!expandido)}
              >
                {expandido ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {expandido && (
          <CardBody className="gap-4">
            {/* Filtro de Período */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label
                  className="text-sm text-default-600 mb-1 block"
                  htmlFor="caixa-aparelhos-data-inicio"
                >
                  Data Início
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  id="caixa-aparelhos-data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label
                  className="text-sm text-default-600 mb-1 block"
                  htmlFor="caixa-aparelhos-data-fim"
                >
                  Data Fim
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  id="caixa-aparelhos-data-fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <Button
                color="primary"
                isLoading={loading}
                onPress={carregarResumo}
              >
                Atualizar
              </Button>
            </div>

            {resumo && (
              <>
                {/* KPIs Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-2 border-primary/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-primary" />
                        <span className="text-sm text-default-600">
                          Aparelhos Vendidos
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {resumo.quantidade_aparelhos_vendidos}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="border-2 border-success/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-sm text-default-600">
                          Total Vendas
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-success">
                        {formatarMoeda(resumo.valor_total_vendas)}
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="border-2 border-warning/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-warning" />
                        <span className="text-sm text-default-600">
                          Lucro Bruto
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-warning">
                        {formatarMoeda(resumo.lucro_bruto)}
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        {margemLucro.toFixed(1)}% de margem
                      </p>
                    </CardBody>
                  </Card>

                  <Card className="border-2 border-secondary/20">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Repeat className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-default-600">Trocas</span>
                      </div>
                      <p className="text-2xl font-bold text-secondary">
                        {resumo.quantidade_trocas}
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        {formatarMoeda(resumo.valor_total_trocas)}
                      </p>
                    </CardBody>
                  </Card>
                </div>

                <Divider />

                {/* Formas de Pagamento */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Formas de Pagamento
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                      <span className="text-sm">Dinheiro</span>
                      <span className="font-semibold">
                        {formatarMoeda(resumo.vendas_dinheiro)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                      <span className="text-sm">PIX</span>
                      <span className="font-semibold">
                        {formatarMoeda(resumo.vendas_pix)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                      <span className="text-sm">Crédito</span>
                      <span className="font-semibold">
                        {formatarMoeda(resumo.vendas_credito)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                      <span className="text-sm">Débito</span>
                      <span className="font-semibold">
                        {formatarMoeda(resumo.vendas_debito)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                      <span className="text-sm">Transfer.</span>
                      <span className="font-semibold">
                        {formatarMoeda(resumo.vendas_transferencia)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão Ver Detalhes */}
                {resumo.aparelhos_vendidos.length > 0 && (
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => setModalDetalheAberto(true)}
                  >
                    Ver Aparelhos Vendidos ({resumo.aparelhos_vendidos.length})
                  </Button>
                )}
              </>
            )}

            {!resumo && !loading && (
              <p className="text-center text-default-500 py-8">
                Nenhuma venda de aparelho neste período
              </p>
            )}
          </CardBody>
        )}
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={modalDetalheAberto}
        scrollBehavior="inside"
        size="5xl"
        onClose={() => setModalDetalheAberto(false)}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-bold">Aparelhos Vendidos no Período</h3>
          </ModalHeader>
          <ModalBody>
            {resumo && (
              <Table aria-label="Tabela de aparelhos vendidos">
                <TableHeader>
                  <TableColumn>APARELHO</TableColumn>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn>VENDEDOR</TableColumn>
                  <TableColumn>VALOR VENDA</TableColumn>
                  <TableColumn>CUSTO</TableColumn>
                  <TableColumn>LUCRO</TableColumn>
                  <TableColumn>DATA</TableColumn>
                </TableHeader>
                <TableBody>
                  {resumo.aparelhos_vendidos.map((aparelho) => (
                    <TableRow key={aparelho.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {aparelho.marca} {aparelho.modelo}
                          </p>
                          {aparelho.imei && (
                            <p className="text-xs text-default-500 font-mono">
                              {aparelho.imei}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{aparelho.cliente_nome}</TableCell>
                      <TableCell>{aparelho.vendedor_nome}</TableCell>
                      <TableCell className="font-semibold text-success">
                        {formatarMoeda(aparelho.valor_venda)}
                      </TableCell>
                      <TableCell className="text-default-500">
                        {formatarMoeda(aparelho.valor_compra)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={aparelho.lucro > 0 ? "success" : "danger"}
                          size="sm"
                        >
                          {formatarMoeda(aparelho.lucro)}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-sm text-default-500">
                        {formatarData(aparelho.data_venda)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={() => setModalDetalheAberto(false)}
            >
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
