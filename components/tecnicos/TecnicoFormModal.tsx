"use client";

import type { Tecnico, TecnicoFormData } from "@/types/clientesTecnicos";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
} from "@heroui/react";
import { Wrench, Phone, Briefcase, Palette } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { criarTecnico, atualizarTecnico } from "@/services/tecnicoService";

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

interface TecnicoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tecnico?: Tecnico;
}

export default function TecnicoFormModal({
  isOpen,
  onClose,
  onSuccess,
  tecnico,
}: TecnicoFormModalProps) {
  const { usuario } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [corAgenda, setCorAgenda] = useState("#3b82f6");

  useEffect(() => {
    if (tecnico) {
      setNome(tecnico.nome || "");
      setCpf(tecnico.cpf || "");
      setTelefone(tecnico.telefone || "");
      setEmail(tecnico.email || "");
      setEspecialidades(tecnico.especialidades || []);
      setRegistroProfissional(tecnico.registro_profissional || "");
      setDataAdmissao(tecnico.data_admissao || "");
      setCorAgenda(tecnico.cor_agenda || "#3b82f6");
    } else {
      limparCampos();
    }
  }, [tecnico, isOpen]);

  const limparCampos = () => {
    setNome("");
    setCpf("");
    setTelefone("");
    setEmail("");
    setEspecialidades([]);
    setRegistroProfissional("");
    setDataAdmissao("");
    setCorAgenda("#3b82f6");
  };

  const toggleEspecialidade = (esp: string) => {
    setEspecialidades((prev) =>
      prev.includes(esp) ? prev.filter((e) => e !== esp) : [...prev, esp],
    );
  };

  const handleSubmit = async () => {
    if (!usuario) {
      toast.error("Usuário não autenticado");

      return;
    }

    if (!nome.trim()) {
      toast.error("Nome é obrigatório");

      return;
    }

    if (!telefone.trim()) {
      toast.error("Telefone é obrigatório");

      return;
    }

    setLoading(true);

    const dados: TecnicoFormData = {
      nome: nome.trim(),
      cpf: cpf.trim() || undefined,
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      especialidades: especialidades.length > 0 ? especialidades : undefined,
      registro_profissional: registroProfissional.trim() || undefined,
      data_admissao: dataAdmissao || undefined,
      cor_agenda: corAgenda,
      ativo: true,
      id_loja: undefined,
    };

    try {
      if (tecnico) {
        const { error } = await atualizarTecnico(tecnico.id, dados, usuario.id);

        if (error) {
          toast.error(error);

          return;
        }
        toast.success("Técnico atualizado com sucesso!");
      } else {
        const { error } = await criarTecnico(dados, usuario.id);

        if (error) {
          toast.error(error);

          return;
        }
        toast.success("Técnico cadastrado com sucesso!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar técnico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          {tecnico ? "Editar Técnico" : "Novo Técnico"}
        </ModalHeader>
        <ModalBody>
          <Tabs aria-label="Dados do Técnico">
            <Tab
              key="pessoais"
              title={
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Dados</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  isRequired
                  label="Nome Completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                  <Input
                    isRequired
                    label="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <Input
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Tab>

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
                </div>
                <Input
                  label="Registro Profissional"
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

            <Tab
              key="config"
              title={
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Configurações</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    htmlFor="cor-agenda-tecnico"
                  >
                    Cor da Agenda
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="w-16 h-16 rounded border-2 border-divider cursor-pointer"
                      id="cor-agenda-tecnico"
                      type="color"
                      value={corAgenda}
                      onChange={(e) => setCorAgenda(e.target.value)}
                    />
                    <div>
                      <p className="text-sm text-default-600">
                        Cor para identificação visual na agenda
                      </p>
                      <p className="text-xs text-default-400 mt-1">
                        {corAgenda}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            {tecnico ? "Atualizar" : "Cadastrar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
