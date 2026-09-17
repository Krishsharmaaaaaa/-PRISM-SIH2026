"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";

export function useProject(projectId: string) {
  return useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then((r: any) => r.data),
    enabled: !!projectId,
  });
}
