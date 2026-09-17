"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  FileJson,
  FileSpreadsheet,
  FileText,
  FileArchive,
  Download,
  Building2,
  Route,
  Hexagon,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ProjectTopBar } from "@/components/layout/project-topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

interface ExportOption {
  key: string;
  filename: string;
  icon: any;
  toneColor: string;
  formatBadge: string;
  title: string;
  description: string;
}

const EXPORTS: ExportOption[] = [
  {
    key: "parcels.geojson",
    filename: "cadastral-parcels.geojson",
    icon: Hexagon,
    toneColor: "text-amber-600 bg-amber-50 border-amber-200",
    formatBadge: "GeoJSON / WGS84",
    title: "Cadastral Parcels — GeoJSON",
    description: "Georeferenced property boundaries in standard OGC GeoJSON format, ready for ArcGIS, QGIS, and web GIS.",
  },
  {
    key: "buildings.geojson",
    filename: "building-footprints.geojson",
    icon: Building2,
    toneColor: "text-red-600 bg-red-50 border-red-200",
    formatBadge: "GeoJSON / Polygons",
    title: "Building Footprints — GeoJSON",
    description: "Multi-vertex roofline contours and building perimeter vectors with estimated area metrics and zoning tags.",
  },
  {
    key: "roads.geojson",
    filename: "road-network.geojson",
    icon: Route,
    toneColor: "text-blue-600 bg-blue-50 border-blue-200",
    formatBadge: "GeoJSON / Lines",
    title: "Road Network & Corridors — GeoJSON",
    description: "Centerlines and corridor boundaries of detected roadways, access lanes, and paths with width estimates.",
  },
  {
    key: "report.pdf",
    filename: "prism-cadastral-survey-report.pdf",
    icon: FileText,
    toneColor: "text-oxblood bg-oxblood-tint border-oxblood/20",
    formatBadge: "Direct PDF Document",
    title: "Official Survey Report — PDF",
    description: "Official Cadastral Survey Certificate (.pdf) featuring executive narrative, parcel schedules, and certification seal.",
  },
  {
    key: "parcels.csv",
    filename: "cadastral-parcel-registry.csv",
    icon: FileSpreadsheet,
    toneColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    formatBadge: "CSV Spreadsheet",
    title: "Cadastral Parcel Registry — CSV",
    description: "Structured spreadsheet schedule of every surveyed parcel: Parcel Code, Land Use, Area (m²), and Topology status.",
  },
  {
    key: "parcels.zip",
    filename: "cadastral-parcels-shapefile.zip",
    icon: FileArchive,
    toneColor: "text-purple-600 bg-purple-50 border-purple-200",
    formatBadge: "ESRI Shapefile ZIP",
    title: "Parcels — ESRI Shapefile (.zip)",
    description: "Complete ESRI Shapefile package (.shp, .shx, .dbf, .prj) calibrated in WGS84 projection coordinates.",
  },
];

export default function ExportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDownload(item: ExportOption) {
    setDownloadingKey(item.key);
    setErrorMessage(null);

    try {
      const url = `${API_BASE_URL}/exports/projects/${projectId}/${item.key}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Server export error (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `prism-${projectId.slice(0, 8).toUpperCase()}-${item.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setDownloadSuccess(item.title);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error("Export download failed:", err);
      setErrorMessage(`Failed to download ${item.title}. Please check server connectivity.`);
    } finally {
      setDownloadingKey(null);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#FBFAF7] text-[#211F1C] relative overflow-hidden font-sans">
      
      {/* Background Dot Matrix (Ultra Low Opacity) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:28px_28px]" />
      
      {/* Flowing Ambient Gradient Lights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[320px] bg-gradient-to-tr from-rose-200 via-pink-100 to-amber-100 rounded-full blur-[120px] pointer-events-none animate-light-flow-1" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-rose-300 via-orange-100 to-rose-100 rounded-full blur-[110px] pointer-events-none animate-light-flow-2" />

      <ProjectTopBar projectId={projectId} title="Download GIS & Cadastral Survey Data" />
      
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F4] px-3.5 py-1 border border-[#F5D0D6] text-xs font-bold text-[#7A1E2E] shadow-2xs mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7A1E2E] animate-pulse" />
                <span>Geospatial Interoperability Pipeline</span>
              </div>
              <h2 className="font-black text-2xl sm:text-3xl text-[#111827] flex items-center gap-2.5 tracking-tight">
                <Layers className="text-[#7A1E2E]" size={26} />
                GIS Data & Cadastral Survey Exports
              </h2>
              <p className="text-xs sm:text-sm text-[#52525B] max-w-xl">
                Export verified vector boundaries, building footprints, road networks, and official PDF survey certificates in standard GIS formats.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>OGC Standards Compliant</span>
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Successfully compiled and downloaded <strong>{downloadSuccess}</strong>!</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold shadow-sm">
              {errorMessage}
            </div>
          )}

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EXPORTS.map((item) => {
              const isDownloading = downloadingKey === item.key;
              const Icon = item.icon;
              const isPdf = item.key.includes("pdf");

              return (
                <div
                  key={item.key}
                  className="rounded-3xl border border-[#EAE6DF] bg-white/90 backdrop-blur-sm p-6 shadow-md hover:shadow-xl hover:border-[#7A1E2E]/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full space-y-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${item.toneColor}`}>
                        <Icon size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#FAF8F5] text-[#52525B] border border-[#EAE6DF] px-3 py-1 rounded-lg">
                        {item.formatBadge}
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-[#111827]">{item.title}</h3>
                    <p className="text-xs text-[#52525B] mt-1.5 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EAE6DF] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#71717A] font-mono truncate max-w-[210px]">
                      {item.filename}
                    </span>
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={isDownloading}
                      className={`flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                        isPdf
                          ? "bg-[#6D1B28] hover:bg-[#58141F] text-white"
                          : "bg-white hover:bg-zinc-50 text-[#111827] border border-[#EAE6DF]"
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#7A1E2E]" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} className={isPdf ? "text-white" : "text-[#7A1E2E]"} />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Geodetic Specification Card */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xs border border-[#EAE6DF] shadow-md text-xs text-[#52525B] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-[#111827] text-sm flex items-center gap-2 justify-center sm:justify-start">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Geodetic Reference Standard
              </p>
              <p className="text-xs">
                All GIS export layers are projected in <strong>EPSG:4326 (WGS84)</strong> geographic coordinates with sub-meter vector precision and verified 0-overlap deed topology.
              </p>
            </div>
            <div className="text-right font-mono text-xs font-bold text-[#7A1E2E] bg-[#FDF2F4] px-3 py-1.5 rounded-xl border border-[#F5D0D6] shrink-0">
              PRISM Cadastre Engine v2.5
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
