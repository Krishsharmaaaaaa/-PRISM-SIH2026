"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TopologyReport } from "@/lib/types";

export function useParcelsGeoJSON(projectId: string) {
  return useQuery<GeoJSON.FeatureCollection>({
    queryKey: ["parcels", projectId],
    queryFn: () => api.get(`/gis/projects/${projectId}/parcels`).then((r: any) => r.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useBuildingsGeoJSON(projectId: string) {
  return useQuery<GeoJSON.FeatureCollection>({
    queryKey: ["buildings", projectId],
    queryFn: () => api.get(`/gis/projects/${projectId}/buildings`).then((r: any) => r.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useRoadsGeoJSON(projectId: string) {
  return useQuery<GeoJSON.FeatureCollection>({
    queryKey: ["roads", projectId],
    queryFn: () => api.get(`/gis/projects/${projectId}/roads`).then((r: any) => r.data),
    enabled: !!projectId,
    refetchInterval: 15000,
  });
}

export function useLatestTopologyReport(projectId: string) {
  return useQuery<TopologyReport | null>({
    queryKey: ["topology-latest", projectId],
    queryFn: () => api.get(`/topology/projects/${projectId}/latest`).then((r: any) => r.data),
    enabled: !!projectId,
  });
}
