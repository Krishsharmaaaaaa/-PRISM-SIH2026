import { AuthGate } from "@/components/layout/auth-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
