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
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Power,
  PowerOff,
  Wallet,
} from "lucide-react";
import { usePermissoes } from "@/hooks/usePermissoes";
import type { Cliente } from "@/types/clientesTecnicos";

interface ClienteCardProps {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onDeletar: (cliente: Cliente) => void;
  onVerHistorico: (cliente: Cliente) => void;
  onToggleAtivo: (cliente: Cliente) => void;
  onGerenciarCreditos?: (cliente: Cliente) => void;
  creditosDisponiveis?: number;
}

export default function ClienteCard({
  cliente,
  onEditar,
  onDeletar,
  onVerHistorico,
  onToggleAtivo,
  onGerenciarCreditos,
  creditosDisponiveis = 0,
}: ClienteCardProps) {
  const { temPermissao } = usePermissoes();

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Filtrar itens do menu baseado em permissões
  const menuItems = [];

  if (temPermissao("clientes.editar")) {
    menuItems.push(
      <DropdownItem
        key="editar"
        startContent={<Edit className="w-4 h-4" />}
        onPress={() => onEditar(cliente)}
      >
        Editar
      </DropdownItem>
    );
  }

  if (temPermissao("clientes.visualizar")) {
    menuItems.push(
      <DropdownItem
        key="historico"
        startContent={<FileText className="w-4 h-4" />}
        onPress={() => onVerHistorico(cliente)}
      >
        Ver Histórico de OS
      </DropdownItem>
    );
  }

  if (onGerenciarCreditos && temPermissao("clientes.processar_creditos")) {
    menuItems.push(
      <DropdownItem
        key="creditos"
        startContent={<Wallet className="w-4 h-4" />}
        onPress={() => onGerenciarCreditos(cliente)}
      >
        Gerenciar Créditos
      </DropdownItem>
    );
  }

  if (temPermissao("clientes.editar")) {
    menuItems.push(
      <DropdownItem
        key="toggle"
        startContent={
          cliente.ativo ? (
            <PowerOff className="w-4 h-4" />
          ) : (
            <Power className="w-4 h-4" />
          )
        }
        onPress={() => onToggleAtivo(cliente)}
      >
        {cliente.ativo ? "Desativar" : "Ativar"}
      </DropdownItem>
    );
  }

  if (temPermissao("clientes.deletar")) {
    menuItems.push(
      <DropdownItem
        key="deletar"
        className="text-danger"
        color="danger"
        startContent={<Trash2 className="w-4 h-4" />}
        onPress={() => onDeletar(cliente)}
      >
        Excluir
      </DropdownItem>
    );
  }
  return (
    <Card className="w-full">
      <CardBody className="gap-3">
        {/* Header com nome e status */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-default-500" />
              <h3 className="font-semibold text-lg">{cliente.nome}</h3>
            </div>
            {cliente.cpf && (
              <p className="text-sm text-default-500">CPF: {cliente.cpf}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={cliente.ativo ? "success" : "danger"}
              variant="flat"
            >
              {cliente.ativo ? "Ativo" : "Inativo"}
            </Chip>

            {menuItems.length > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ações do cliente">
                  {menuItems}
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>

        {/* Contatos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-default-400" />
            <span>{cliente.telefone}</span>
          </div>

          {cliente.telefone_secundario && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-default-400" />
              <span>{cliente.telefone_secundario}</span>
            </div>
          )}

          {cliente.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-default-400" />
              <span>{cliente.email}</span>
            </div>
          )}
        </div>

        {/* Créditos */}
        {creditosDisponiveis > 0 && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success-700">
                  Créditos Disponíveis
                </span>
              </div>
              <span className="text-base font-bold text-success">
                {formatarMoeda(creditosDisponiveis)}
              </span>
            </div>
          </div>
        )}

        {/* Endereço (se houver) */}
        {(cliente.cidade || cliente.estado) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-default-400 mt-0.5" />
            <div>
              {cliente.logradouro && (
                <p>
                  {cliente.logradouro}
                  {cliente.numero ? `, ${cliente.numero}` : ""}
                </p>
              )}
              {cliente.bairro && <p>{cliente.bairro}</p>}
              {(cliente.cidade || cliente.estado) && (
                <p>
                  {cliente.cidade}
                  {cliente.estado && ` - ${cliente.estado}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Observações (se houver) */}
        {cliente.observacoes && (
          <div className="pt-2 border-t border-divider">
            <p className="text-xs text-default-500 line-clamp-2">
              {cliente.observacoes}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
