import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import {
  BellIcon,
  BellAlertIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useNotificacoes } from "@/hooks/useNotificacoes";

interface NotificacoesDropdownProps {
  usuarioId: string | undefined;
}

// Função auxiliar para formatar tempo relativo
function formatarTempoRelativo(data: string): string {
  const agora = new Date();
  const dataNotif = new Date(data);
  const diffMs = agora.getTime() - dataNotif.getTime();
  const diffMinutos = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMinutos / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMinutos < 1) return "Agora mesmo";
  if (diffMinutos < 60)
    return `Há ${diffMinutos} minuto${diffMinutos > 1 ? "s" : ""}`;
  if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  if (diffDias < 7) return `Há ${diffDias} dia${diffDias > 1 ? "s" : ""}`;

  return dataNotif.toLocaleDateString("pt-BR");
}

export function NotificacoesDropdown({ usuarioId }: NotificacoesDropdownProps) {
  const {
    notificacoes,
    naoLidas,
    countNaoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotificacoes(usuarioId);

  const [tabSelecionada, setTabSelecionada] = useState<"todas" | "nao-lidas">(
    "nao-lidas",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notificacoesExibir =
    tabSelecionada === "nao-lidas" ? naoLidas : notificacoes;

  const getCorNotificacao = (tipo: string) => {
    switch (tipo) {
      case "estoque_zerado":
        return "danger";
      case "estoque_baixo":
        return "warning";
      case "estoque_reposto":
        return "success";
      case "sistema":
        return "primary";
      default:
        return "default";
    }
  };

  const getIconeNotificacao = (tipo: string) => {
    switch (tipo) {
      case "estoque_zerado":
      case "estoque_baixo":
        return "⚠️";
      case "estoque_reposto":
        return "✅";
      case "sistema":
        return "📢";
      default:
        return "🔔";
    }
  };

  return (
    <>
      {/* Botão Mobile - abre modal */}
      <Button
        isIconOnly
        aria-label="Notificações"
        className="relative lg:hidden"
        variant="light"
        onPress={() => setIsModalOpen(true)}
      >
        {countNaoLidas > 0 ? (
          <Badge
            color="danger"
            content={countNaoLidas > 99 ? "99+" : countNaoLidas}
            placement="top-right"
            size="sm"
          >
            <BellAlertIcon className="w-6 h-6 text-warning animate-pulse" />
          </Badge>
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
      </Button>

      {/* Dropdown - Desktop */}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            aria-label="Notificações"
            className="relative hidden lg:flex"
            variant="light"
          >
            {countNaoLidas > 0 ? (
              <Badge
                color="danger"
                content={countNaoLidas > 99 ? "99+" : countNaoLidas}
                placement="top-right"
                size="sm"
              >
                <BellAlertIcon className="w-6 h-6 text-warning animate-pulse" />
              </Badge>
            ) : (
              <BellIcon className="w-6 h-6" />
            )}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Notificações"
          className="p-0"
          classNames={{
            base: "w-[500px]",
          }}
          closeOnSelect={false}
        >
          <DropdownSection
            showDivider
            classNames={{
              heading: "px-4 pt-4 pb-2",
            }}
          >
            {/* Header */}
            <DropdownItem
              key="header"
              isReadOnly
              className="cursor-default opacity-100"
              classNames={{
                base: "p-0 gap-0 data-[hover=true]:bg-transparent",
              }}
              textValue="Header de notificações"
            >
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Notificações</h3>
                  <div className="flex gap-2">
                    {countNaoLidas > 0 && (
                      <Button
                        color="primary"
                        size="sm"
                        startContent={<CheckIcon className="w-4 h-4" />}
                        variant="flat"
                        onPress={marcarTodasComoLidas}
                      >
                        Marcar todas
                      </Button>
                    )}
                    {notificacoes.length > 0 && (
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={limparTodas}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <Tabs
                  fullWidth
                  selectedKey={tabSelecionada}
                  size="sm"
                  onSelectionChange={(key) =>
                    setTabSelecionada(key as "todas" | "nao-lidas")
                  }
                >
                  <Tab
                    key="nao-lidas"
                    title={
                      <div className="flex items-center gap-2">
                        <span>Não Lidas</span>
                        {countNaoLidas > 0 && (
                          <Chip color="danger" size="sm" variant="flat">
                            {countNaoLidas}
                          </Chip>
                        )}
                      </div>
                    }
                  />
                  <Tab key="todas" title={`Todas (${notificacoes.length})`} />
                </Tabs>
              </div>
            </DropdownItem>
          </DropdownSection>

          {/* Lista de Notificações */}
          <DropdownSection
            classNames={{
              base: "max-h-96 overflow-y-auto",
            }}
          >
            {loading ? (
              <DropdownItem
                key="loading"
                isReadOnly
                textValue="Carregando notificações"
              >
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-default-400 mt-2">Carregando...</p>
                </div>
              </DropdownItem>
            ) : notificacoesExibir.length === 0 ? (
              <DropdownItem
                key="empty"
                isReadOnly
                textValue="Nenhuma notificação"
              >
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                  <p className="text-sm text-default-400">
                    {tabSelecionada === "nao-lidas"
                      ? "Nenhuma notificação não lida"
                      : "Nenhuma notificação"}
                  </p>
                </div>
              </DropdownItem>
            ) : (
              notificacoesExibir.map((notificacao) => (
                <DropdownItem
                  key={notificacao.id}
                  className={`px-4 py-3 ${!notificacao.lida ? "bg-primary-50/50 dark:bg-primary-900/10" : ""}`}
                  textValue={notificacao.titulo}
                  onPress={() => marcarComoLida(notificacao.id)}
                >
                  <div className="flex gap-3">
                    {/* Ícone */}
                    <div className="shrink-0 text-2xl">
                      {getIconeNotificacao(notificacao.tipo)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {notificacao.titulo}
                        </h4>
                        {!notificacao.lida && (
                          <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-default-600 line-clamp-2 mb-2">
                        {notificacao.mensagem}
                      </p>

                      <div className="flex items-center gap-2">
                        <Chip
                          color={getCorNotificacao(notificacao.tipo) as any}
                          size="sm"
                          variant="flat"
                        >
                          {notificacao.tipo.replace("_", " ")}
                        </Chip>
                        <span className="text-xs text-default-400">
                          {formatarTempoRelativo(notificacao.criado_em)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownItem>
              ))
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Modal - Mobile */}
      <Modal
        classNames={{
          base: "m-0 sm:m-0",
          wrapper: "items-end sm:items-center",
        }}
        isOpen={isModalOpen}
        scrollBehavior="inside"
        size="full"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-3 px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Notificações</h3>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  {countNaoLidas > 0 && (
                    <Button
                      className="flex-1"
                      color="primary"
                      size="sm"
                      startContent={<CheckIcon className="w-4 h-4" />}
                      variant="flat"
                      onPress={marcarTodasComoLidas}
                    >
                      Marcar todas
                    </Button>
                  )}
                  {notificacoes.length > 0 && (
                    <Button
                      className="flex-1"
                      color="danger"
                      size="sm"
                      startContent={<XMarkIcon className="w-4 h-4" />}
                      variant="flat"
                      onPress={limparTodas}
                    >
                      Limpar
                    </Button>
                  )}
                </div>

                {/* Tabs */}
                <Tabs
                  fullWidth
                  selectedKey={tabSelecionada}
                  size="md"
                  onSelectionChange={(key) =>
                    setTabSelecionada(key as "todas" | "nao-lidas")
                  }
                >
                  <Tab
                    key="nao-lidas"
                    title={
                      <div className="flex items-center gap-2">
                        <span>Não Lidas</span>
                        {countNaoLidas > 0 && (
                          <Chip color="danger" size="sm" variant="flat">
                            {countNaoLidas}
                          </Chip>
                        )}
                      </div>
                    }
                  />
                  <Tab key="todas" title={`Todas (${notificacoes.length})`} />
                </Tabs>
              </ModalHeader>

              <ModalBody className="px-4 pb-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-default-400 mt-3">
                      Carregando...
                    </p>
                  </div>
                ) : notificacoesExibir.length === 0 ? (
                  <div className="text-center py-12">
                    <BellIcon className="w-16 h-16 mx-auto text-default-300 mb-3" />
                    <p className="text-sm text-default-400">
                      {tabSelecionada === "nao-lidas"
                        ? "Nenhuma notificação não lida"
                        : "Nenhuma notificação"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notificacoesExibir.map((notificacao) => (
                      <button
                        key={notificacao.id}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${
                          !notificacao.lida
                            ? "bg-primary-50 dark:bg-primary-900/20"
                            : "bg-default-100 hover:bg-default-200"
                        }`}
                        onClick={() => marcarComoLida(notificacao.id)}
                      >
                        <div className="flex gap-3">
                          {/* Ícone */}
                          <div className="shrink-0 text-2xl">
                            {getIconeNotificacao(notificacao.tipo)}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                {notificacao.titulo}
                              </h4>
                              {!notificacao.lida && (
                                <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                              )}
                            </div>

                            <p className="text-xs text-default-600 mb-2">
                              {notificacao.mensagem}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Chip
                                color={
                                  getCorNotificacao(notificacao.tipo) as any
                                }
                                size="sm"
                                variant="flat"
                              >
                                {notificacao.tipo.replace("_", " ")}
                              </Chip>
                              <span className="text-xs text-default-400">
                                {formatarTempoRelativo(notificacao.criado_em)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
