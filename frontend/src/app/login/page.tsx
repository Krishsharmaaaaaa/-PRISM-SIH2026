"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Satellite, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { apiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("technicalkunal30@gmail.com");
  const [password, setPassword] = useState("Admin@123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail = email, loginPass = password) {
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      router.push("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't sign you in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  async function handleQuickDemoLogin() {
    setEmail("technicalkunal30@gmail.com");
    setPassword("Admin@123456");
    await handleLogin("technicalkunal30@gmail.com", "Admin@123456");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-oxblood text-white shadow-subtle">
            <Satellite size={24} strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">PRISM Cadastral Platform</h1>
          <p className="mt-1.5 text-sm text-stone">
            AI-powered drone photogrammetry & automated land records mapping
          </p>
        </div>

        <div className="bg-surface border border-hairlineStrong rounded-2xl p-7 shadow-float animate-slide-up space-y-6">
          
          {/* Quick Demo Login Banner */}
          <div className="rounded-xl border border-oxblood/20 bg-oxblood-tint/50 p-4">
            <div className="flex items-center gap-2 text-oxblood font-semibold text-xs uppercase tracking-wide mb-1">
              <ShieldCheck size={16} /> Instant Admin Access
            </div>
            <p className="text-xs text-stone mb-3">
              Click below to sign in immediately with pre-configured Admin credentials.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loading}
              onClick={handleQuickDemoLogin}
              className="w-full justify-center text-xs font-semibold py-2.5 shadow-sm"
            >
              <Sparkles size={14} className="mr-1.5" /> ⚡ 1-Click Sign In as Admin
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-hairline"></div>
            <span className="flex-shrink mx-3 text-xs text-stoneLight uppercase font-medium">Or enter credentials</span>
            <div className="flex-grow border-t border-hairline"></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-xs font-medium text-ink mb-1 block">Work Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium text-ink mb-1 block">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full py-2.5 text-sm" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to Workspace"} <ArrowRight size={15} className="ml-1" />
            </Button>

            <p className="mt-4 text-center text-xs text-stone">
              New to PRISM?{" "}
              <Link href="/register" className="text-oxblood font-semibold hover:underline">
                Set up your organization
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
