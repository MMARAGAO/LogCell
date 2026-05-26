import type { ReactNode } from "react";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";

interface PermissionGuardProps {
  permission: boolean;
  loading: boolean;
  children: ReactNode;
  fallbackMessage?: string;
}

export function PermissionGuard({
  permission,
  loading,
  children,
  fallbackMessage = "Você não tem permissão para acessar esta página.",
}: PermissionGuardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardBody>
            <p className="text-danger">{fallbackMessage}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
