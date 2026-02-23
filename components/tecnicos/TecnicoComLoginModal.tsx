"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import { UserPlus, Phone, Briefcase, Palette, Lock, Mail } from "lucide-react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { TecnicosService } from "@/services/tecnicosService";

const especialidadesDisponiveis = [
  "Smartphones",
  "Tablets",
  "Notebooks",
  "Desktops",
  "Consoles",
  "Smartwatches",
  "Acessórios",
  "Solda",
  "Recuperação de Dados",
  "Software",
  "Redes",
];

interface TecnicoComLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TecnicoComLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: TecnicoComLoginModalProps) {
  const { usuario } = useAuthContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Dados Pessoais
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Dados de Login
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Dados Profissionais
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [corAgenda, setCorAgenda] = useState("#3b82f6");

  const limparCampos = () => {
    setNome("");
    setCpf("");
    setTelefone("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setEspecialidades([]);
    setRegistroProfissional("");
    setDataAdmissao(new Date().toISOString().split("T")[0]);
    setCorAgenda("#3b82f6");
  };

  const toggleEspecialidade = (esp: string) => {
    setEspecialidades((prev) =>
      prev.includes(esp) ? prev.filter((e) => e !== esp) : [...prev, esp],
    );
  };

  const validarFormulario = (): boolean => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");

      return false;
    }

    if (!email.trim()) {
      toast.error("E-mail é obrigatório para login");

      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("E-mail inválido");

      return false;
    }

    if (!telefone.trim()) {
      toast.error("Telefone é obrigatório");

      return false;
    }

    if (!senha) {
      toast.error("Senha é obrigatória");

      return false;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");

      return false;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");

      return false;
    }

    return true;
  };

  // Verifica se todos os campos obrigatórios estão preenchidos (sem mostrar toast)
  const formularioValido = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      nome.trim() !== "" &&
      email.trim() !== "" &&
      emailRegex.test(email) &&
      telefone.trim() !== "" &&
      senha !== "" &&
      senha.length >= 6 &&
      senha === confirmarSenha
    );
  };

  const handleSubmit = async () => {
    if (!usuario) {
      toast.error("Usuário não autenticado. Faça login novamente.");

      return;
    }

    if (!usuario.id) {
      toast.error("ID do usuário não encontrado. Faça login novamente.");

      return;
    }

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Enviando para API:", {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        criado_por: usuario.id,
        temSenha: !!senha,
      });

      const { tecnico, error } = await TecnicosService.criarTecnicoComAuth(
        {
          nome: nome.trim(),
          email: email.trim(),
          senha: senha,
          telefone: telefone.trim(),
          cpf: cpf.trim() || undefined,
          especialidades:
            especialidades.length > 0 ? especialidades : undefined,
          registro_profissional: registroProfissional.trim() || undefined,
          data_admissao: dataAdmissao || undefined,
          cor_agenda: corAgenda,
        },
        usuario.id,
      );

      if (error) {
        console.error("❌ Erro retornado:", error);
        toast.error(error);

        return;
      }

      console.log("✅ Técnico criado:", tecnico);
      toast.success("Técnico criado com sucesso! Já pode fazer login.");
      limparCampos();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar técnico:", error);
      toast.error(error.message || "Erro ao criar técnico com login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={() => {
        limparCampos();
        onClose();
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Novo Técnico com Login
        </ModalHeader>
        <ModalBody>
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              🔐 Este técnico terá acesso ao sistema com login próprio. Ele
              poderá visualizar e gerenciar suas Ordens de Serviço.
            </p>
          </div>

          <Tabs aria-label="Cadastro de Técnico">
            {/* ABA 1: Dados de Login */}
            <Tab
              key="login"
              title={
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  isRequired
                  description="Este e-mail será usado para fazer login no sistema"
                  label="E-mail"
                  placeholder="tecnico@exemplo.com"
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  isRequired
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  startContent={<Lock className="w-4 h-4 text-default-400" />}
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <Input
                  isRequired
                  color={
                    confirmarSenha && senha !== confirmarSenha
                      ? "danger"
                      : "default"
                  }
                  errorMessage={
                    confirmarSenha && senha !== confirmarSenha
                      ? "As senhas não coincidem"
                      : undefined
                  }
                  label="Confirmar Senha"
                  placeholder="Digite a senha novamente"
                  startContent={<Lock className="w-4 h-4 text-default-400" />}
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </div>
            </Tab>

            {/* ABA 2: Dados Pessoais */}
            <Tab
              key="pessoais"
              title={
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Dados Pessoais</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  isRequired
                  label="Nome Completo"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
              </div>
            </Tab>

            {/* ABA 3: Dados Profissionais */}
            <Tab
              key="profissional"
              title={
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Profissional</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm font-medium mb-2 block">
                    Especialidades
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {especialidadesDisponiveis.map((esp) => (
                      <Chip
                        key={esp}
                        className="cursor-pointer"
                        color={
                          especialidades.includes(esp) ? "primary" : "default"
                        }
                        variant={
                          especialidades.includes(esp) ? "solid" : "bordered"
                        }
                        onClick={() => toggleEspecialidade(esp)}
                      >
                        {esp}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-xs text-default-400 mt-2">
                    Clique para selecionar as especialidades do técnico
                  </p>
                </div>
                <Input
                  label="Registro Profissional"
                  placeholder="Ex: CREA 12345"
                  value={registroProfissional}
                  onChange={(e) => setRegistroProfissional(e.target.value)}
                />
                <Input
                  label="Data de Admissão"
                  type="date"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                />
              </div>
            </Tab>

            {/* ABA 4: Configurações */}
            <Tab
              key="config"
              title={
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Visual</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    htmlFor="cor-agenda-tecnico-login"
                  >
                    Cor da Agenda
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="w-20 h-20 rounded-lg border-2 border-divider cursor-pointer"
                      id="cor-agenda-tecnico-login"
                      type="color"
                      value={corAgenda}
                      onChange={(e) => setCorAgenda(e.target.value)}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-default-600 mb-1">
                        Esta cor será usada para identificar visualmente este
                        técnico na agenda e relatórios
                      </p>
                      <Chip
                        className="text-white"
                        style={{ backgroundColor: corAgenda }}
                      >
                        {nome || "Técnico"} - {corAgenda}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            onPress={() => {
              limparCampos();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!formularioValido() || loading}
            isLoading={loading}
            startContent={!loading && <UserPlus className="w-4 h-4" />}
            onPress={handleSubmit}
          >
            Criar Técnico com Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
