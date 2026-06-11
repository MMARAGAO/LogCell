"use client";

import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface SistemaLayoutClientProps {
  children: React.ReactNode;
}

export function SistemaLayoutClient({ children }: SistemaLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar (desktop: flex flow, mobile: overlay via fixed) */}
      {/* contents = não afeta o layout normal; print:hidden remove na impressão */}
      <div className="contents print:hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content - no margin needed, sidebar is in flex flow on lg+ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 print:overflow-visible">
        <div className="contents print:hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 print:overflow-visible print:bg-white">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
