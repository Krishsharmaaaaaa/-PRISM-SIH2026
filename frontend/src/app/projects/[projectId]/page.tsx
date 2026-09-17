"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProjectIndexPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}/upload`);
    }
  }, [projectId, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface">
      <div className="flex items-center gap-3 text-stone text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-oxblood" />
        <span>Loading AI Cadastral Imagery & Polygon Studio…</span>
      </div>
    </div>
  );
}

