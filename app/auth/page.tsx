"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { CadastroForm } from "@/components/auth/CadastroForm";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Smartphone } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "cadastro">("login");
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">(
    "other"
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
        handleBeforeInstallPrompt
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
            <strong>"Adicionar à Tela de Início"</strong>
          </li>
          <li>
            Toque em <strong>"Adicionar"</strong> no canto superior direito
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
            Selecione <strong>"Adicionar à tela inicial"</strong> ou{" "}
            <strong>"Instalar app"</strong>
          </li>
          <li>
            Confirme tocando em <strong>"Adicionar"</strong>
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
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen max-h-screen overflow-y-auto lg:overflow-y-visible bg-background relative">
      {/* Logo no canto superior esquerdo */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-10">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full p-3 sm:p-4 shadow-lg border border-primary/20 hover:scale-110 transition-transform duration-200 flex items-center justify-center">
          <Logo className="w-full h-full text-foreground" />
        </div>
      </div>

      {/* Botão de instalação - apenas em mobile e se não estiver instalado */}
      {!isStandalone && deviceType !== "other" && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-10">
          <Button
            isIconOnly
            variant="flat"
            color="primary"
            className="shadow-lg"
            onPress={handleInstallClick}
          >
            <Smartphone className="w-5 h-5" />
          </Button>
        </div>
      )}

      <Card className="w-full max-w-xl shadow-lg my-auto">
        <CardBody className="p-6 sm:p-8 lg:p-10 max-h-[calc(100vh-2rem)] lg:max-h-none overflow-y-auto lg:overflow-y-visible">
          <div className="text-center mb-6 sm:mb-8">
            {/* Título */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              LogCell
            </h1>
            <p className="text-default-500 text-xs sm:text-sm">
              Sistema de Gestão de Estoque
            </p>
          </div>

          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) =>
              setActiveTab(key as "login" | "cadastro")
            }
            className="mb-6 w-full"
            classNames={{
              tabList: "w-full",
              tab: "flex-1",
            }}
          >
            <Tab key="login" title="Login">
              <LoginForm onSwitchToCadastro={() => setActiveTab("cadastro")} />
            </Tab>
            <Tab key="cadastro" title="Cadastro">
              <CadastroForm onSwitchToLogin={() => setActiveTab("login")} />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Modal de instruções */}
      <Modal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <Smartphone className="w-5 h-5" />
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
