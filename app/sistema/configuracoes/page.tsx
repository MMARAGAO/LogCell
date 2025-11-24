"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { useTheme } from "next-themes";
import { MoonIcon, PaintBrushIcon } from "@heroicons/react/24/outline";
import { useConfiguracoes } from "@/contexts/ConfiguracoesContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { configuracoes, carregando, atualizarConfiguracoes } =
    useConfiguracoes();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();

  // Estados locais para as configurações
  const [modoEscuro, setModoEscuro] = useState(false);
  const [tema, setTemaLocal] = useState("default");
  const [configuracoesCarregadas, setConfiguracoesCarregadas] = useState(false);

  // Carregar configurações quando disponíveis (apenas uma vez)
  useEffect(() => {
    if (configuracoes && !configuracoesCarregadas) {
      // Sincronizar com o tema atual do next-themes (prioridade)
      const temaAtual = theme || "light";
      setModoEscuro(temaAtual === "dark");

      setTemaLocal(configuracoes.tema);
      setConfiguracoesCarregadas(true);
    }
  }, [configuracoes, configuracoesCarregadas, theme]);

  // Aplicar tema imediatamente quando mudar modo escuro manualmente
  useEffect(() => {
    if (configuracoesCarregadas) {
      const novoTema = modoEscuro ? "dark" : "light";
      setTheme(novoTema);

      // Forçar persistência no localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("logcell-theme", novoTema);
      }

      // Salvar automaticamente no banco quando mudar
      if (configuracoes && modoEscuro !== configuracoes.modo_escuro) {
        // Salvar com timeout para evitar múltiplas chamadas
        const timer = setTimeout(() => {
          atualizarConfiguracoes({ modo_escuro: modoEscuro }).catch((error) => {
            console.error("❌ Erro ao salvar modo escuro:", error);
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [modoEscuro, configuracoesCarregadas, setTheme, configuracoes]);
  // Aplicar tema de cores através do contexto
  useEffect(() => {
    if (
      configuracoesCarregadas &&
      configuracoes &&
      tema !== configuracoes.tema
    ) {
      // Salvar com timeout para evitar múltiplas chamadas
      const timer = setTimeout(() => {
        atualizarConfiguracoes({ tema: tema }).catch((error) => {
          console.error("❌ Erro ao salvar tema:", error);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [tema, configuracoesCarregadas, configuracoes, atualizarConfiguracoes]);

  // Verificar permissão de administrador
  if (!loadingPermissoes && !temPermissao("configuracoes.gerenciar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Apenas administradores podem acessar as configurações do sistema.
        </p>
      </div>
    );
  }

  if (carregando || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Spinner size="lg" label="Carregando configurações..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-default-500 mt-2">
          Personalize as preferências do sistema de acordo com suas necessidades
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <Card className="shadow-sm">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <PaintBrushIcon className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Aparência</p>
              <p className="text-small text-default-500">
                Personalize a interface do sistema
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo escuro</p>
                <p className="text-sm text-default-500">
                  Ative o tema escuro para reduzir o cansaço visual
                </p>
              </div>
              <Switch
                isSelected={modoEscuro}
                onValueChange={setModoEscuro}
                color="primary"
                startContent={<MoonIcon className="w-4 h-4" />}
              />
            </div>

            <Select
              label="Tema do sistema"
              placeholder="Selecione um tema"
              selectedKeys={new Set([tema])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setTemaLocal(selected);
              }}
              variant="bordered"
              description="Escolha a cor principal do sistema"
            >
              <SelectItem key="default">Padrão (Azul)</SelectItem>
              <SelectItem key="purple">Roxo</SelectItem>
              <SelectItem key="green">Verde</SelectItem>
              <SelectItem key="orange">Laranja</SelectItem>
            </Select>
          </CardBody>
        </Card>

        {/* Preview do Tema */}
        <Card className="shadow-sm">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PaintBrushIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Preview do Tema</p>
              <p className="text-small text-default-500">
                Visualize como ficará a interface
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <div className="relative w-full h-[400px] rounded-b-lg overflow-hidden">
              <div className="absolute inset-0 flex flex-col gap-4 p-6 bg-background">
                {/* Exemplo de Card com tema aplicado */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">
                      Tema Ativo:{" "}
                      {tema === "default"
                        ? "Azul"
                        : tema === "purple"
                          ? "Roxo"
                          : tema === "green"
                            ? "Verde"
                            : "Laranja"}
                    </span>
                  </div>
                  <Divider />
                </div>

                {/* Botões de exemplo */}
                <div className="flex flex-wrap gap-2">
                  <Button color="primary" size="sm">
                    Primário
                  </Button>
                  <Button color="secondary" size="sm">
                    Secundário
                  </Button>
                  <Button color="success" size="sm">
                    Sucesso
                  </Button>
                  <Button color="warning" size="sm">
                    Aviso
                  </Button>
                  <Button color="danger" size="sm">
                    Perigo
                  </Button>
                </div>

                {/* Card de exemplo */}
                <Card className="bg-content1">
                  <CardBody className="gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Card de Exemplo
                    </p>
                    <p className="text-xs text-default-500">
                      Este é um exemplo de como os elementos ficarão com o tema
                      selecionado.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1 h-2 rounded-full bg-secondary"></div>
                      <div className="flex-1 h-2 rounded-full bg-success"></div>
                    </div>
                  </CardBody>
                </Card>

                {/* Switch de exemplo */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    Opção de exemplo
                  </span>
                  <Switch size="sm" defaultSelected color="primary" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toast Component */}
      {toast.ToastComponent}
    </div>
  );
}
