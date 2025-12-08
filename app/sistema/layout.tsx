import { ProtectedRoute } from "@/components/auth";
import { SistemaLayoutClient } from "@/components/sistema/SistemaLayoutClient";
import { SessionGuard } from "@/components/SessionGuard";

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
      <SessionGuard>
        <SistemaLayoutClient>{children}</SistemaLayoutClient>
      </SessionGuard>
    </ProtectedRoute>
  );
}
