"use client";

import { Card, CardBody } from "@heroui/card";
import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color: "primary" | "warning" | "success" | "danger";
  delay?: number;
}

const colorMap = {
  primary: {
    gradient: "from-primary-500/10 to-transparent",
    border: "border-primary",
    iconBg: "bg-primary-500/15 text-primary",
    text: "text-primary",
  },
  warning: {
    gradient: "from-warning-500/10 to-transparent",
    border: "border-warning",
    iconBg: "bg-warning-500/15 text-warning",
    text: "text-warning",
  },
  success: {
    gradient: "from-success-500/10 to-transparent",
    border: "border-success",
    iconBg: "bg-success-500/15 text-success",
    text: "text-success",
  },
  danger: {
    gradient: "from-danger-500/10 to-transparent",
    border: "border-danger",
    iconBg: "bg-danger-500/15 text-danger",
    text: "text-danger",
  },
};

export function MetricCard({
  icon,
  value,
  label,
  color,
  delay = 0,
}: MetricCardProps) {
  const c = colorMap[color];

  return (
    <Card
      className={`border-l-4 ${c.border} bg-gradient-to-br ${c.gradient} animate-fade-in`}
      shadow="sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p
              className={`text-lg sm:text-xl font-bold ${c.text} leading-tight`}
            >
              {value}
            </p>
            <p className="text-[10px] sm:text-xs text-default-500 font-medium uppercase tracking-wider">
              {label}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${c.iconBg}`}>{icon}</div>
        </div>
      </CardBody>
    </Card>
  );
}
