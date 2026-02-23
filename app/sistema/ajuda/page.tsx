"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { useToast } from "@/components/Toast";

export default function AjudaPage() {
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleEnviarSuporte = async () => {
    setEnviando(true);
    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
    setNome("");
    setEmail("");
    setAssunto("");
    setMensagem("");
    setEnviando(false);
  };

  const faqItems = [
    {
      key: "1",
      title: "Como faço para adicionar um novo usuário?",
      content:
        "Para adicionar um novo usuário, vá em 'Usuários' no menu lateral, clique no botão '+ Novo Usuário' e preencha o formulário com as informações necessárias. Você pode definir permissões específicas para cada usuário.",
      categoria: "Usuários",
    },
    {
      key: "2",
      title: "Como gerenciar o estoque de produtos?",
      content:
        "Acesse a seção 'Estoque' no menu. Lá você pode adicionar produtos, atualizar quantidades, definir níveis mínimos de estoque e receber alertas automáticos quando o estoque estiver baixo.",
      categoria: "Estoque",
    },
    {
      key: "3",
      title: "Como cadastrar uma nova loja?",
      content:
        "Vá em 'Lojas' no menu lateral e clique em '+ Nova Loja'. Preencha os dados como nome, endereço, telefone e responsável. Você também pode adicionar fotos da loja e visualizar o histórico de alterações.",
      categoria: "Lojas",
    },
    {
      key: "4",
      title: "Como alterar minha senha?",
      content:
        "Acesse seu 'Perfil' no menu do usuário (clique no avatar no canto superior direito). Na seção 'Segurança', você encontrará a opção 'Alterar Senha'. Digite a senha atual e a nova senha duas vezes para confirmar.",
      categoria: "Conta",
    },
    {
      key: "5",
      title: "Como ativar o modo escuro?",
      content:
        "Clique no avatar no canto superior direito e vá em 'Configurações'. Na seção 'Aparência', ative o switch 'Modo escuro'. Não esqueça de clicar em 'Salvar Configurações' para persistir a mudança.",
      categoria: "Configurações",
    },
    {
      key: "6",
      title: "Como visualizar o histórico de alterações?",
      content:
        "Nas telas de Usuários e Lojas, cada registro possui um menu de ações (três pontos). Clique e selecione 'Ver Histórico' para visualizar todas as alterações realizadas no registro, incluindo data, usuário responsável e valores modificados.",
      categoria: "Auditoria",
    },
    {
      key: "7",
      title: "Como gerenciar permissões de usuários?",
      content:
        "Na tela de 'Usuários', clique no menu de ações do usuário desejado e selecione 'Gerenciar Permissões'. Você pode definir permissões específicas para Dashboard, Estoque, Lojas, Usuários e Configurações.",
      categoria: "Permissões",
    },
    {
      key: "8",
      title: "O que fazer se esquecer minha senha?",
      content:
        "Na tela de login, clique em 'Esqueci minha senha'. Digite seu email cadastrado e você receberá um link para redefinir sua senha. O link é válido por 24 horas.",
      categoria: "Conta",
    },
  ];

  const recursos = [
    {
      icon: BookOpenIcon,
      titulo: "Documentação",
      descricao: "Guias completos e tutoriais passo a passo",
      cor: "primary",
      link: "/docs",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      titulo: "Chat ao Vivo",
      descricao: "Suporte em tempo real de segunda a sexta",
      cor: "success",
      link: "https://wa.me/5561982928478?text=Olá,%20preciso%20de%20ajuda%20com%20o%20sistema%20LogCell",
    },
    {
      icon: EnvelopeIcon,
      titulo: "Email",
      descricao: "mathdevbr@gmail.com",
      cor: "secondary",
      link: "mailto:mathdevbr@gmail.com",
    },
    {
      icon: PhoneIcon,
      titulo: "Telefone",
      descricao: "(61) 9 8292-8478",
      cor: "warning",
      link: "tel:+5561982928478",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <QuestionMarkCircleIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Central de Ajuda
            </h1>
            <p className="text-default-500 mt-1">
              Encontre respostas e entre em contato com nossa equipe de suporte
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ */}
          <Card className="shadow-sm">
            <CardHeader className="flex gap-3 pb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpenIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">
                  Perguntas Frequentes (FAQ)
                </p>
                <p className="text-small text-default-500">
                  Respostas para as dúvidas mais comuns
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <Accordion variant="splitted">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.key}
                    aria-label={item.title}
                    className="mb-2"
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        <Chip color="primary" size="sm" variant="flat">
                          {item.categoria}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="text-default-600 pb-3">{item.content}</div>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>

          {/* Formulário de Contato */}
          <Card className="shadow-sm">
            <CardHeader className="flex gap-3 pb-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-success" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Entre em Contato</p>
                <p className="text-small text-default-500">
                  Não encontrou o que procura? Envie uma mensagem
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Nome completo"
                  placeholder="Digite seu nome"
                  value={nome}
                  variant="bordered"
                  onValueChange={setNome}
                />
                <Input
                  isRequired
                  label="Email"
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                  variant="bordered"
                  onValueChange={setEmail}
                />
              </div>

              <Input
                isRequired
                label="Assunto"
                placeholder="Sobre o que você precisa de ajuda?"
                value={assunto}
                variant="bordered"
                onValueChange={setAssunto}
              />

              <Textarea
                isRequired
                label="Mensagem"
                minRows={5}
                placeholder="Descreva sua dúvida ou problema em detalhes..."
                value={mensagem}
                variant="bordered"
                onValueChange={setMensagem}
              />

              <Button
                className="w-full md:w-auto"
                color="primary"
                isDisabled={!nome || !email || !assunto || !mensagem}
                isLoading={enviando}
                size="lg"
                onPress={handleEnviarSuporte}
              >
                Enviar Mensagem
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Canais de Suporte */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-lg font-semibold">Canais de Suporte</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              {recursos.map((recurso, index) => {
                const Icon = recurso.icon;

                return (
                  <Button
                    key={index}
                    as="a"
                    className="h-auto py-4 justify-start"
                    href={recurso.link}
                    startContent={
                      <div
                        className={`p-2 bg-${recurso.cor}/10 rounded-lg shrink-0`}
                      >
                        <Icon className={`w-5 h-5 text-${recurso.cor}`} />
                      </div>
                    }
                    variant="flat"
                  >
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-semibold">{recurso.titulo}</span>
                      <span className="text-xs text-default-500">
                        {recurso.descricao}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </CardBody>
          </Card>

          {/* Horário de Atendimento */}
          <Card className="shadow-sm">
            <CardHeader className="flex gap-3 pb-3">
              <ClockIcon className="w-5 h-5 text-warning" />
              <p className="text-lg font-semibold">Horário de Atendimento</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Segunda a Sexta</span>
                <Chip color="success" size="sm" variant="flat">
                  8h - 18h
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sábado</span>
                <Chip color="warning" size="sm" variant="flat">
                  9h - 13h
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Domingo e Feriados</span>
                <Chip color="danger" size="sm" variant="flat">
                  Fechado
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Dicas Rápidas */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-lg font-semibold">Dicas Rápidas</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              <div className="flex gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Atalhos de Teclado</p>
                  <p className="text-xs text-default-500">
                    Use Ctrl+K para busca rápida
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <InformationCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Modo Escuro</p>
                  <p className="text-xs text-default-500">
                    Configure em Ajustes &gt; Aparência
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Backup Regular</p>
                  <p className="text-xs text-default-500">
                    Seus dados são salvos automaticamente
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Toast Component */}
      {toast.ToastComponent}
    </div>
  );
}
