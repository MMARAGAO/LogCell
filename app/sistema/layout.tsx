import { ProtectedRoute } from "@/components/auth";
import { SistemaLayoutClient } from "@/components/sistema/SistemaLayoutClient";

/**
 * Layout do sistema (Server Component)
 * Não pode ter "use client" - layouts devem ser Server Components
 */
export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SistemaLayoutClient>{children}</SistemaLayoutClient>
    </ProtectedRoute>
  );
}
