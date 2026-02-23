"use client";

import type { Cliente, ClienteFormData } from "@/types/clientesTecnicos";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { User, Phone, MapPin, FileText } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { criarCliente, atualizarCliente } from "@/services/clienteService";
import { formatarCEP, formatarTelefone } from "@/types/clientesTecnicos";

function formatarDoc(valor: string): string {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length <= 11) {
    // CPF
    if (numeros.length === 0) return "";
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6)
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9)
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
  } else {
    // CNPJ
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5)
      return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    if (numeros.length <= 8)
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
    if (numeros.length <= 12)
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;

    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
  }
}

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente?: Cliente;
}

const estados = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export default function ClienteFormModal({
  isOpen,
  onClose,
  onSuccess,
  cliente,
}: ClienteFormModalProps) {
  const { usuario } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Dados Pessoais
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Contatos
  const [telefone, setTelefone] = useState("");
  const [telefoneSecundario, setTelefoneSecundario] = useState("");
  const [email, setEmail] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Outros
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome || "");
      setDoc(cliente.doc || "");
      setDataNascimento(cliente.data_nascimento || "");
      setTelefone(cliente.telefone || "");
      setTelefoneSecundario(cliente.telefone_secundario || "");
      setEmail(cliente.email || "");
      setCep(cliente.cep || "");
      setLogradouro(cliente.logradouro || "");
      setNumero(cliente.numero || "");
      setComplemento(cliente.complemento || "");
      setBairro(cliente.bairro || "");
      setCidade(cliente.cidade || "");
      setEstado(cliente.estado || "");
      setObservacoes(cliente.observacoes || "");
    } else {
      limparCampos();
    }
  }, [cliente, isOpen]);

  const limparCampos = () => {
    setNome("");
    setDoc("");
    setDataNascimento("");
    setTelefone("");
    setTelefoneSecundario("");
    setEmail("");
    setCep("");
    setLogradouro("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setEstado("");
    setObservacoes("");
  };

  const buscarCep = async (cepValue: string) => {
    const cepNumeros = cepValue.replace(/\D/g, "");

    if (cepNumeros.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepNumeros}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");

        return;
      }

      setLogradouro(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado(data.uf || "");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
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

    setLoading(true);

    const dados: ClienteFormData = {
      nome: nome.trim(),
      doc: doc.trim() || null,
      data_nascimento: dataNascimento || undefined,
      telefone: telefone.trim() || null,
      telefone_secundario: telefoneSecundario.trim() || undefined,
      email: email.trim() || null,
      cep: cep.trim() || undefined,
      logradouro: logradouro.trim() || undefined,
      numero: numero.trim() || undefined,
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado || undefined,
      observacoes: observacoes.trim() || undefined,
      ativo: true,
      id_loja: undefined,
    };

    try {
      if (cliente) {
        const { error } = await atualizarCliente(cliente.id, dados, usuario.id);

        if (error) {
          toast.error(error);

          return;
        }
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await criarCliente(dados, usuario.id);

        if (error) {
          toast.error(error);

          return;
        }
        toast.success("Cliente cadastrado com sucesso!");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {cliente ? "Editar Cliente" : "Novo Cliente"}
        </ModalHeader>
        <ModalBody>
          <Tabs aria-label="Dados do Cliente">
            {/* ABA: Dados Pessoais */}
            <Tab
              key="pessoais"
              title={
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Dados Pessoais</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  isRequired
                  label="Nome Completo"
                  placeholder="Digite o nome do cliente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="CPF ou CNPJ"
                    maxLength={18}
                    placeholder="Digite o CPF ou CNPJ"
                    value={doc}
                    onChange={(e) => setDoc(formatarDoc(e.target.value))}
                  />
                </div>

                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>
            </Tab>

            {/* ABA: Contatos */}
            <Tab
              key="contatos"
              title={
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Contatos</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  isRequired
                  label="Telefone Principal"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  startContent={<Phone className="w-4 h-4 text-default-400" />}
                  value={telefone}
                  onChange={(e) =>
                    setTelefone(formatarTelefone(e.target.value))
                  }
                />

                <Input
                  label="Telefone Secundário"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  startContent={<Phone className="w-4 h-4 text-default-400" />}
                  value={telefoneSecundario}
                  onChange={(e) =>
                    setTelefoneSecundario(formatarTelefone(e.target.value))
                  }
                />

                <Input
                  label="E-mail"
                  placeholder="cliente@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Tab>

            {/* ABA: Endereço */}
            <Tab
              key="endereco"
              title={
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Endereço</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Input
                  disabled={loadingCep}
                  label="CEP"
                  maxLength={9}
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => {
                    const cepFormatado = formatarCEP(e.target.value);

                    setCep(cepFormatado);
                    if (cepFormatado.replace(/\D/g, "").length === 8) {
                      buscarCep(cepFormatado);
                    }
                  }}
                />

                <Input
                  label="Logradouro"
                  placeholder="Rua, Avenida, etc"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Número"
                    placeholder="123"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />

                  <Input
                    label="Complemento"
                    placeholder="Apto, Bloco, etc"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>

                <Input
                  label="Bairro"
                  placeholder="Nome do bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Cidade"
                    placeholder="Nome da cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />

                  <Select
                    label="Estado"
                    placeholder="Selecione"
                    selectedKeys={estado ? [estado] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];

                      setEstado(selected as string);
                    }}
                  >
                    {estados.map((e) => (
                      <SelectItem key={e.value}>{e.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </Tab>

            {/* ABA: Observações */}
            <Tab
              key="observacoes"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Observações</span>
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <Textarea
                  label="Observações"
                  minRows={6}
                  placeholder="Informações adicionais sobre o cliente..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            {cliente ? "Atualizar" : "Cadastrar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
