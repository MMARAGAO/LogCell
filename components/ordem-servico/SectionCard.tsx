"use client";

import type { ReactNode } from "react";

import { twMerge } from "tailwind-merge";

interface SectionCardProps {
  /** Ícone exibido em um tile neutro à esquerda do título. */
  icon?: ReactNode;
  /** Título da seção. Se ausente, o header não é renderizado. */
  title?: ReactNode;
  /** Conteúdo opcional alinhado à direita no header (botão, chip, contador). */
  action?: ReactNode;
  /** Classes extras aplicadas ao container do card. */
  className?: string;
  /** Classes extras aplicadas ao corpo do card. */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Padrão único de card de seção da tela de OS.
 *
 * Frame neutro corporativo: rounded-xl + border-default-200/70 + bg-content1 +
 * shadow-sm. Header opcional com ícone em tile neutro, título e slot de ação.
 *
 * Substitui o uso de <Card>/<CardHeader>/<CardBody> (shadow-medium, títulos
 * text-lg) para unificar a linguagem visual entre as abas.
 */
export default function SectionCard({
  icon,
  title,
  action,
  className = "",
  bodyClassName = "",
  children,
}: SectionCardProps) {
  return (
    <div
      className={twMerge(
        "bg-content1 rounded-xl shadow-sm border border-default-200/70 p-5",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-default-200/70">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className="w-7 h-7 rounded-lg bg-default-100 flex items-center justify-center shrink-0 text-default-500">
                {icon}
              </div>
            )}
            {title && (
              <span className="text-sm font-semibold text-foreground truncate">
                {title}
              </span>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
