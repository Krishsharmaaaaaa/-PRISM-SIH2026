"use client";

import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-paper">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

