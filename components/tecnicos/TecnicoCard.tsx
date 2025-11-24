"use client";

import {
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import {
  MoreVertical,
  Edit,
  History,
  ToggleLeft,
  Trash2,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import type { Tecnico } from "@/types/clientesTecnicos";

interface TecnicoCardProps {
  tecnico: Tecnico;
  menuItems: Array<{
    key: string;
    label: string;
    icon: string;
    onClick: () => void;
    color?: "danger" | "default";
  }>;
}

export default function TecnicoCard({ tecnico, menuItems }: TecnicoCardProps) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      history: <History className="w-4 h-4" />,
      toggle: <ToggleLeft className="w-4 h-4" />,
      delete: <Trash2 className="w-4 h-4" />,
    };
    return icons[iconName] || <MoreVertical className="w-4 h-4" />;
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: tecnico.cor_agenda }}
            >
              {tecnico.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold">{tecnico.nome}</h3>
              {tecnico.registro_profissional && (
                <p className="text-xs text-default-500">
                  Reg: {tecnico.registro_profissional}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={tecnico.ativo ? "success" : "danger"}
              variant="flat"
            >
              {tecnico.ativo ? "Ativo" : "Inativo"}
            </Chip>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Ações">
                {menuItems.map((item) => (
                  <DropdownItem
                    key={item.key}
                    startContent={getIcon(item.icon)}
                    onPress={item.onClick}
                    color={item.color}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="space-y-2">
          {tecnico.telefone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-default-400" />
              <span>{tecnico.telefone}</span>
            </div>
          )}
          {tecnico.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-default-400" />
              <span className="truncate">{tecnico.email}</span>
            </div>
          )}
          {tecnico.especialidades && tecnico.especialidades.length > 0 && (
            <div className="flex items-start gap-2 mt-3">
              <Briefcase className="w-4 h-4 text-default-400 mt-1" />
              <div className="flex flex-wrap gap-1">
                {tecnico.especialidades.map((esp) => (
                  <Chip key={esp} size="sm" variant="flat">
                    {esp}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          {tecnico.data_admissao && (
            <p className="text-xs text-default-500 mt-2">
              Admitido em:{" "}
              {new Date(tecnico.data_admissao).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
