"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const res: any = await api.get("/projects");
        const list = res?.data ?? res;
        if (Array.isArray(list) && list.length > 0) {
          router.replace(`/projects/${list[0]._id}/upload`);
          return;
        }
      } catch (err) {
        // ignore
      }
      router.replace("/projects/6aabb5f492fa58e7033199dc/upload");
    }
    init();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface">
      <div className="text-center space-y-2">
        <div className="h-6 w-6 border-2 border-oxblood border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-stone text-xs font-medium">Opening AI Cadastral Studio…</p>
      </div>
    </div>
  );
}

