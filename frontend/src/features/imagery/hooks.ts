"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ImageryDataset } from "@/lib/types";

export function useImageryList(projectId: string) {
  return useQuery<ImageryDataset[]>({
    queryKey: ["imagery", projectId],
    queryFn: () => api.get(`/imagery/project/${projectId}`).then((r: any) => r.data),
    enabled: !!projectId,
  });
}

export interface UploadImageryInput {
  file: File;
  projectId: string;
  type: string;
  neLat?: number;
  neLng?: number;
  swLat?: number;
  swLng?: number;
}

export function useUploadImagery(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadImageryInput) => {
      const form = new FormData();
      form.append("file", input.file);
      form.append("projectId", input.projectId);
      form.append("type", input.type);
      if (input.neLat) form.append("neLat", String(input.neLat));
      if (input.neLng) form.append("neLng", String(input.neLng));
      if (input.swLat) form.append("swLat", String(input.swLat));
      if (input.swLng) form.append("swLng", String(input.swLng));
      return api
        .post("/imagery/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
        .then((r: any) => (r?.data !== undefined ? r.data : r));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["imagery", projectId] }),
  });
}

export function useDeleteImagery(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/imagery/${id}`).then((r: any) => (r?.data !== undefined ? r.data : r)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imagery", projectId] });
      queryClient.invalidateQueries({ queryKey: ["gis", projectId] });
    },
  });
}
