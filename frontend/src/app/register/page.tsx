"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { api, apiErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [orgName, setOrgName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const orgRes: any = await api.post("/organizations", { name: orgName, jurisdiction });
      const organizationId = orgRes.data._id;
      await register({ fullName, email, password, organizationId });
      router.push("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-oxblood text-white">
            <Satellite size={22} strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold text-ink">Set up your organization</h1>
          <p className="mt-1 text-sm text-stone max-w-sm">
            This creates your land department&apos;s workspace and signs you in as its first administrator.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-surface border border-hairline rounded-md p-7 shadow-panel animate-slide-up space-y-4"
        >
          {error && (
            <div className="rounded border border-oxblood/25 bg-oxblood-tint px-3 py-2.5 text-sm text-oxblood-dark">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="orgName">Department or organization name</Label>
            <Input id="orgName" required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Ghaziabad Municipal Corporation" />
          </div>
          <div>
            <Label htmlFor="jurisdiction">City or jurisdiction (optional)</Label>
            <Input id="jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Ghaziabad, Uttar Pradesh" />
          </div>
          <hr className="border-hairline" />
          <div>
            <Label htmlFor="fullName">Your full name</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Anita Sharma" />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="[email protected]" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up…" : "Create organization & continue"}
          </Button>

          <p className="text-center text-sm text-stone">
            Already have an account?{" "}
            <Link href="/login" className="text-oxblood font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
