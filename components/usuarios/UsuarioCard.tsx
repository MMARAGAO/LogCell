"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  PencilIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useFotoPerfilUsuario } from "@/hooks/useFotoPerfilUsuario";
import { usePermissoes } from "@/hooks/usePermissoes";
import type { Usuario } from "@/types";

interface UsuarioCardProps {
  usuario: Usuario;
  onEditar: (usuario: Usuario) => void;
  onPermissoes: (usuario: Usuario) => void;
  onHistorico: (usuario: Usuario) => void;
  onAlternarStatus: (usuario: Usuario) => void;
  onExcluir: (usuario: Usuario) => void;
}

export function UsuarioCard({
  usuario,
  onEditar,
  onPermissoes,
  onHistorico,
  onAlternarStatus,
  onExcluir,
}: UsuarioCardProps) {
  const { fotoUrl } = useFotoPerfilUsuario(usuario.id);
  const { temPermissao } = usePermissoes();

  // Gerar itens do menu baseado em permissões
  const menuItems = [];

  if (temPermissao("usuarios.editar")) {
    menuItems.push(
      <DropdownItem
        key="permissions"
        startContent={<ShieldCheckIcon className="w-4 h-4" />}
        onPress={() => onPermissoes(usuario)}
      >
        Gerenciar Permissões
      </DropdownItem>
    );
  }

  if (temPermissao("usuarios.visualizar")) {
    menuItems.push(
      <DropdownItem
        key="historico"
        startContent={<ClockIcon className="w-4 h-4" />}
        onPress={() => onHistorico(usuario)}
      >
        Ver Histórico
      </DropdownItem>
    );
  }

  if (temPermissao("usuarios.editar")) {
    menuItems.push(
      <DropdownItem
        key="toggle-status"
        startContent={
          usuario.ativo ? (
            <XCircleIcon className="w-4 h-4" />
          ) : (
            <CheckCircleIcon className="w-4 h-4" />
          )
        }
        onPress={() => onAlternarStatus(usuario)}
      >
        {usuario.ativo ? "Desativar" : "Ativar"}
      </DropdownItem>
    );
  }

  if (temPermissao("usuarios.deletar")) {
    menuItems.push(
      <DropdownItem
        key="delete"
        className="text-danger"
        color="danger"
        startContent={<TrashIcon className="w-4 h-4" />}
        onPress={() => onExcluir(usuario)}
      >
        Excluir
      </DropdownItem>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-divider p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar
          name={usuario.nome}
          src={fotoUrl || undefined}
          size="lg"
          showFallback
          color="primary"
          className="mb-3"
        />
        <h3 className="font-semibold text-lg">{usuario.nome}</h3>
        <p className="text-sm text-default-500">{usuario.email}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-500">Telefone:</span>
          <span>{usuario.telefone || "Não informado"}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-500">CPF:</span>
          <span>{usuario.cpf || "Não informado"}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-500">Criado em:</span>
          <span>{new Date(usuario.criado_em).toLocaleDateString("pt-BR")}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-default-500">Status:</span>
          <Chip
            color={usuario.ativo ? "success" : "danger"}
            variant="flat"
            size="sm"
          >
            {usuario.ativo ? "Ativo" : "Inativo"}
          </Chip>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {temPermissao("usuarios.editar") && (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            className="flex-1"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={() => onEditar(usuario)}
          >
            Editar
          </Button>
        )}
        {menuItems.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="flat">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações do usuário">
              {menuItems}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
