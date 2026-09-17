import { AuthGate } from "@/components/layout/auth-gate";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
