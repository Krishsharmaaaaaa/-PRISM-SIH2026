"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ExtractionSummary } from "@/lib/types";

export interface ExtractionResponse {
  jobId: string;
  summary: ExtractionSummary;
  rawDetections?: {
    buildings: any[];
    roads: any[];
    landUseZones: any[];
    notes?: string;
  };
}

export function useRunExtraction(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageryId: string) =>
      api
        .post(`/ai/imagery/${imageryId}/extract`, { projectId })
        .then((r: any) => r.data as ExtractionResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels", projectId] });
      queryClient.invalidateQueries({ queryKey: ["buildings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["roads", projectId] });
      queryClient.invalidateQueries({ queryKey: ["imagery", projectId] });
    },
  });
}
