"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  DevicePhoneMobileIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { CadastroForm } from "@/components/auth/CadastroForm";
import { LoginForm } from "@/components/auth/LoginForm";
import Logo from "@/components/Logo";

const DESTAQUES = [
  {
    icon: BuildingStorefrontIcon,
    titulo: "Gestão multi-loja",
    descricao: "Estoque, transferências e relatórios por loja.",
  },
  {
    icon: BanknotesIcon,
    titulo: "Caixa & financeiro",
    descricao: "Controle de vendas, recebimentos e fechamento.",
  },
  {
    icon: WrenchScrewdriverIcon,
    titulo: "Ordens de serviço",
    descricao: "Acompanhe reparos, técnicos e garantias.",
  },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "cadastro">("login");
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">(
    "other",
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Verificar se já está instalado
    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    setIsStandalone(standalone);

    // Detectar tipo de dispositivo
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType("ios");
    } else if (/android/.test(userAgent)) {
      setDeviceType("android");
    }

    // Capturar o evento beforeinstallprompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // Se tiver o prompt nativo (Android/Chrome), usar ele
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      // iOS não suporta a API, mostrar instruções
      setShowInstallModal(true);
    }
  };

  const getInstructions = () => {
    if (deviceType === "ios") {
      return (
        <ol className="list-decimal list-inside space-y-2 text-left">
          <li>
            Toque no botão de <strong>Compartilhar</strong> (quadrado com seta
            para cima) na parte inferior da tela
          </li>
          <li>
            Role para baixo e toque em{" "}
            <strong>&quot;Adicionar à Tela de Início&quot;</strong>
          </li>
          <li>
            Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior
            direito
          </li>
        </ol>
      );
    } else if (deviceType === "android") {
      return (
        <ol className="list-decimal list-inside space-y-2 text-left">
          <li>
            Toque no menu <strong>⋮</strong> (três pontos) no canto superior
            direito
          </li>
          <li>
            Selecione <strong>&quot;Adicionar à tela inicial&quot;</strong> ou{" "}
            <strong>&quot;Instalar app&quot;</strong>
          </li>
          <li>
            Confirme tocando em <strong>&quot;Adicionar&quot;</strong>
          </li>
        </ol>
      );
    }

    return (
      <p className="text-left">
        Use o menu do seu navegador para adicionar este site à tela inicial do
        seu dispositivo.
      </p>
    );
  };

  return (
    <div className="green flex min-h-screen bg-background text-foreground">
      {/* Painel de marca (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-default-200/70 bg-primary-50 p-12 lg:flex xl:w-[55%]">
        {/* Decoração sutil */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/5" />

        {/* Topo: logo + nome */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-default-200/70 bg-content1 p-2 shadow-sm">
            <Logo forceLight className="h-full w-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            LogCell
          </span>
        </div>

        {/* Meio: tagline + destaques */}
        <div className="relative max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">
              Controle de estoque, vendas e OS em um só lugar.
            </h2>
            <p className="text-default-500">
              A plataforma de gestão da sua operação — do balcão ao fechamento
              de caixa.
            </p>
          </div>

          <ul className="space-y-5">
            {DESTAQUES.map((d) => (
              <li key={d.titulo} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <d.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{d.titulo}</p>
                  <p className="text-sm text-default-500">{d.descricao}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <p className="relative text-xs text-default-400">
          © {new Date().getFullYear()} LogCell · Sistema de Gestão
        </p>
      </div>

      {/* Painel do formulário */}
      <div className="relative flex w-full items-center justify-center overflow-y-auto p-6 sm:p-10 lg:w-1/2 xl:w-[45%]">
        {/* Botão de instalação (mobile, se não instalado) */}
        {!isStandalone && deviceType !== "other" && (
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={handleInstallClick}
            >
              <DevicePhoneMobileIcon className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="w-full max-w-md">
          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            {/* Logo (apenas mobile, já que desktop tem painel de marca) */}
            <div className="mb-5 flex justify-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-default-200/70 bg-content1 p-2.5 shadow-sm">
                <Logo forceLight className="h-full w-full" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {activeTab === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </h1>
            <p className="mt-1 text-sm text-default-500">
              {activeTab === "login"
                ? "Entre com suas credenciais para continuar."
                : "Preencha seus dados para começar."}
            </p>
          </div>

          {activeTab === "login" ? (
            <LoginForm onSwitchToCadastro={() => setActiveTab("cadastro")} />
          ) : (
            <CadastroForm onSwitchToLogin={() => setActiveTab("login")} />
          )}
        </div>
      </div>

      {/* Modal de instruções */}
      <Modal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <DevicePhoneMobileIcon className="w-5 h-5" />
            Adicionar à Tela Inicial
          </ModalHeader>
          <ModalBody>
            <p className="mb-4 text-default-600">
              Para acessar o LogCell mais rapidamente, adicione-o à tela inicial
              do seu {deviceType === "ios" ? "iPhone" : "celular"}:
            </p>
            {getInstructions()}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setShowInstallModal(false)}>
              Entendi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
