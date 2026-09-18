"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  Sparkles,
  Building2,
  Route,
  Hexagon,
  Timer,
  MapPinned,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  RefreshCw,
  X,
  ScanLine,
  Trash2,
} from "lucide-react";
import { ProjectTopBar } from "@/components/layout/project-topbar";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useImageryList, useUploadImagery, useDeleteImagery } from "@/features/imagery/hooks";
import { useRunExtraction } from "@/features/ai/hooks";
import { apiErrorMessage, API_BASE_URL } from "@/lib/api";
import { ExtractionSummary, ImageryDataset } from "@/lib/types";
import { ImageAiInspector, ImageAiDetections } from "@/components/imagery/image-ai-inspector";
import { useToast } from "@/components/ui/toast";

const TYPE_LABELS: Record<string, string> = {
  drone_rgb: "Raw Drone Photo (RGB)",
  orthomosaic: "Stitched Orthomosaic (ORI)",
  dsm: "Digital Surface Model (DSM)",
  dtm: "Digital Terrain Model (DTM)",
};

type ProcessingStage = "idle" | "uploading" | "ai_analyzing" | "saving_layers" | "completed";

export default function UploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: datasets, isLoading } = useImageryList(projectId);
  const upload = useUploadImagery(projectId);
  const extraction = useRunExtraction(projectId);
  const deleteImagery = useDeleteImagery(projectId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [type, setType] = useState("drone_rgb");
  const [autoExtract, setAutoExtract] = useState(true);
  const [showCoords, setShowCoords] = useState(false);
  const [neLat, setNeLat] = useState("");
  const [neLng, setNeLng] = useState("");
  const [swLat, setSwLat] = useState("");
  const [swLng, setSwLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [stageMessage, setStageMessage] = useState("");
  
  // Inspected / Active dataset for the visualizer
  const [inspectedDataset, setInspectedDataset] = useState<{
    id: string;
    fileName: string;
    imageUrl: string;
    detections: ImageAiDetections;
    summary?: ExtractionSummary;
  } | null>(null);

  const handleFileChange = (file: File | null) => {
    setPendingFile(file);
    setError(null);
    if (file && !datasetName) {
      setDatasetName(file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_\-\s]/g, " "));
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setPendingFile(null);
    setDatasetName("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingFile) return;
    setError(null);

    const uploadedImageUrl = previewUrl || (pendingFile.type.startsWith("image/") ? URL.createObjectURL(pendingFile) : "");
    const originalFileName = pendingFile.name;

    try {
      setStage("uploading");
      setStageMessage("Uploading imagery dataset to server...");
      toast.info("Uploading Aerial Photo", originalFileName);

      const uploadResult = await upload.mutateAsync({
        file: pendingFile,
        projectId,
        type,
        neLat: neLat ? parseFloat(neLat) : undefined,
        neLng: neLng ? parseFloat(neLng) : undefined,
        swLat: swLat ? parseFloat(swLat) : undefined,
        swLng: swLng ? parseFloat(swLng) : undefined,
      });

      const imageryId = (uploadResult as any)?._id || (uploadResult as any)?.data?._id;

      if (autoExtract && imageryId) {
        setStage("ai_analyzing");
        setStageMessage("PRISM Deep Learning Vision analyzing image: detecting buildings, roads & parcels...");
        toast.info("AI Analysis Running", "Detecting roof contours, road networks & plot boundaries...");

        const extractResult = await extraction.mutateAsync(imageryId);

        setStage("saving_layers");
        setStageMessage("Vectorizing building footprints, road corridors & cadastral parcels...");

        const rawData = (extractResult as any)?.data || extractResult;
        const detections = rawData?.rawDetections || {
          buildings: rawData?.buildings?.map((b: any) => ({
            polygon: b.footprint?.coordinates?.[0],
            category: b.category,
            confidence: b.aiConfidence,
          })) || [],
          roads: rawData?.roads?.map((r: any) => ({
            path: r.centerline?.coordinates,
            category: r.category,
            estimatedWidthM: r.estimatedWidthM,
            confidence: r.aiConfidence,
          })) || [],
          landUseZones: rawData?.parcels?.map((p: any) => ({
            polygon: p.boundary?.coordinates?.[0],
            landUse: p.landUse,
            confidence: p.aiConfidence,
          })) || [],
          notes: rawData?.summary?.aiNotes || "Feature polygons extracted accurately.",
        };

        const displayName = datasetName.trim() || originalFileName;

        setInspectedDataset({
          id: imageryId,
          fileName: displayName,
          imageUrl: uploadedImageUrl || `${API_BASE_URL}/imagery/${imageryId}/file`,
          detections,
          summary: rawData?.summary,
        });

        // Refresh all workspace queries
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["parcels", projectId] });
        queryClient.invalidateQueries({ queryKey: ["buildings", projectId] });
        queryClient.invalidateQueries({ queryKey: ["roads", projectId] });
        queryClient.invalidateQueries({ queryKey: ["imagery", projectId] });

        setStage("completed");
        setStageMessage("AI Mapping & Feature Recognition Complete!");
        toast.success("AI Cadastral Mapping Complete!", `Extracted ${detections.buildings.length} buildings & ${detections.roads.length} road corridors.`);
      } else {
        setStage("idle");
        clearFile();
        queryClient.invalidateQueries({ queryKey: ["imagery", projectId] });
        toast.success("Dataset Uploaded", "Image uploaded and queued in project datasets.");
      }
    } catch (err) {
      setStage("idle");
      const msg = apiErrorMessage(err, "Failed to upload or analyze the photo. Please try again.");
      setError(msg);
      toast.error("Upload / Analysis Error", msg);
    }
  }

  async function onExtract(imageryId: string, fileName: string) {
    setError(null);
    try {
      setStage("ai_analyzing");
      setStageMessage("Deep Learning Photogrammetry Engine is extracting cadastral features from aerial imagery...");
      toast.info("Extracting Features", `Analyzing "${fileName}" with vision AI...`);
      const result = await extraction.mutateAsync(imageryId);
      
      const rawData = (result as any)?.data || result;
      const detections = rawData?.rawDetections || {
        buildings: rawData?.buildings?.map((b: any) => ({
          polygon: b.footprint?.coordinates?.[0],
          category: b.category,
          confidence: b.aiConfidence,
        })) || [],
        roads: rawData?.roads?.map((r: any) => ({
          path: r.centerline?.coordinates,
          category: r.category,
          estimatedWidthM: r.estimatedWidthM,
          confidence: r.aiConfidence,
        })) || [],
        landUseZones: rawData?.parcels?.map((p: any) => ({
          polygon: p.boundary?.coordinates?.[0],
          landUse: p.landUse,
          confidence: p.aiConfidence,
        })) || [],
        notes: rawData?.summary?.aiNotes || "Feature recognition complete.",
      };

      setInspectedDataset({
        id: imageryId,
        fileName: fileName,
        imageUrl: `${API_BASE_URL}/imagery/${imageryId}/file`,
        detections,
        summary: rawData?.summary,
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["parcels", projectId] });
      queryClient.invalidateQueries({ queryKey: ["buildings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["roads", projectId] });
      queryClient.invalidateQueries({ queryKey: ["imagery", projectId] });
      setStage("idle");
      toast.success("Cadastral Extraction Complete!", `Extracted ${detections.buildings.length} buildings & ${detections.roads.length} road corridors.`);
    } catch (err) {
      setStage("idle");
      const msg = apiErrorMessage(err, "The AI could not analyze this image.");
      setError(msg);
      toast.error("Analysis Failed", msg);
    }
  }

  const handleInspectDataset = (d: ImageryDataset) => {
    const detections: ImageAiDetections = d.aiDetections || {
      buildings: [],
      roads: [],
      landUseZones: [],
      notes: "Feature polygons recognized on aerial photograph.",
    };

    setInspectedDataset({
      id: d._id,
      fileName: d.originalFileName,
      imageUrl: `${API_BASE_URL}/imagery/${d._id}/file`,
      detections,
    });
  };

  const isBusy = stage !== "idle" || upload.isPending || extraction.isPending;

  return (
    <div className="flex h-screen flex-col bg-[#FBFAF7] text-[#211F1C] relative overflow-hidden font-sans">
      
      {/* Background Dot Matrix (Ultra Low Opacity) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] [background-image:radial-gradient(#7A1E2E_1px,transparent_1px)] [background-size:28px_28px]" />
      
      {/* Flowing Ambient Gradient Lights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[320px] bg-gradient-to-tr from-rose-200 via-pink-100 to-amber-100 rounded-full blur-[120px] pointer-events-none animate-light-flow-1" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-gradient-to-bl from-rose-300 via-orange-100 to-rose-100 rounded-full blur-[110px] pointer-events-none animate-light-flow-2" />

      <ProjectTopBar projectId={projectId} title="Drone & Aerial Imagery" />
      
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Main Upload Card */}
          <div className="rounded-3xl border border-[#EAE6DF] bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="border-b border-[#EAE6DF] bg-[#FAF8F5]/80 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F4] px-3.5 py-1 border border-[#F5D0D6] text-xs font-bold text-[#7A1E2E] shadow-2xs mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7A1E2E] animate-pulse" />
                    <span>Multimodal Cadastral Intelligence</span>
                  </div>
                  <h2 className="font-black text-xl sm:text-2xl text-[#111827] flex items-center gap-2 tracking-tight">
                    <Sparkles className="text-[#7A1E2E]" size={22} />
                    AI Aerial & Drone Recognition Studio
                  </h2>
                  <p className="text-xs sm:text-sm text-[#52525B] mt-1 max-w-2xl">
                    Upload raw drone photographs, aerial surveys, or stitched orthomosaics. Deep learning extracts vectorized building perimeters, road networks, and parcel deeds with instant <strong>Original vs AI Prediction Comparison</strong>.
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#52525B] bg-white px-3 py-1.5 rounded-xl border border-[#EAE6DF] shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>EPSG:4326 Datum</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800 flex items-start gap-3 shadow-xs">
                  <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Action Failed</p>
                    <p className="mt-0.5 text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Multi-Stage Active Processing Banner */}
              {isBusy && (
                <div className="rounded-2xl border border-[#7A1E2E]/30 bg-[#FDF2F4]/80 backdrop-blur-xs p-5 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <Loader2 className="h-6 w-6 animate-spin text-[#7A1E2E] shrink-0" />
                    <div>
                      <p className="font-bold text-[#7A1E2E] text-sm sm:text-base">
                        {stage === "uploading" && "Stage 1/3: Ingesting Photo & Calibrating Resolution"}
                        {stage === "ai_analyzing" && "Stage 2/3: Deep Learning Multimodal Feature Extraction"}
                        {stage === "saving_layers" && "Stage 3/3: Generating Polygons & OGC Deed Topology Verification"}
                        {stage === "completed" && "Completed! All Features Recognized & Drawn"}
                        {stage === "idle" && "AI Processing in progress..."}
                      </p>
                      <p className="text-xs text-[#52525B] mt-0.5">{stageMessage}</p>
                    </div>
                  </div>
                  {/* Visual Progress Line */}
                  <div className="mt-4 h-2 w-full bg-[#7A1E2E]/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7A1E2E] to-rose-500 transition-all duration-500 rounded-full"
                      style={{
                        width:
                          stage === "uploading"
                            ? "30%"
                            : stage === "ai_analyzing"
                            ? "70%"
                            : stage === "saving_layers"
                            ? "90%"
                            : stage === "completed"
                            ? "100%"
                            : "50%",
                      }}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={onUpload} className="space-y-6">
                {/* Drag and Drop Zone */}
                <div>
                  <Label htmlFor="file" className="block text-sm font-medium text-ink mb-2">
                    Select Drone or Aerial Imagery
                  </Label>
                  
                  {!pendingFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-hairlineStrong bg-surfaceSunken/40 px-6 py-10 text-center hover:border-oxblood hover:bg-oxblood-tint/20 transition-all"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-subtle group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-7 w-7 text-oxblood" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-ink">
                        Click to select an aerial photo <span className="text-stone font-normal">or drag & drop</span>
                      </p>
                      <p className="mt-1 text-xs text-stoneLight">
                        Supports JPEG, PNG, TIFF, WebP, GeoTIFF, and Drone survey captures
                      </p>
                      <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept="image/*,.tif,.tiff"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-oxblood/30 bg-white p-4 shadow-subtle gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-16 w-16 rounded-lg object-cover border border-hairline shrink-0"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surfaceMuted border border-hairline shrink-0">
                            <ImageIcon className="h-8 w-8 text-stone" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-ink truncate">{pendingFile.name}</p>
                          <p className="text-xs text-stone mt-0.5">
                            {(pendingFile.size / (1024 * 1024)).toFixed(2)} MB • {pendingFile.type || "Image"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1">
                            <CheckCircle2 size={12} /> Ready for Recognition & Extraction
                          </span>
                        </div>
                      </div>

                      {!isBusy && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearFile}
                          className="text-stone hover:text-red-600 self-end sm:self-auto"
                        >
                          <X size={16} /> Remove
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Dataset Survey Name / File Label Input */}
                <div>
                  <Label htmlFor="datasetName" className="text-sm font-medium text-ink mb-1.5 block">
                    Survey Dataset Name / File Label <span className="text-stone font-normal text-xs">(Customizable)</span>
                  </Label>
                  <input
                    id="datasetName"
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    disabled={isBusy}
                    placeholder="e.g. Sector-4B-Aerial-Photogrammetry-Survey"
                    className="h-11 w-full rounded-lg border border-hairlineStrong bg-white px-3.5 text-sm text-ink focus:border-oxblood focus:ring-1 focus:ring-oxblood focus:outline-none placeholder:text-stoneLight"
                  />
                  <p className="text-[11px] text-stone mt-1">
                    Label assigned to this aerial survey in datasets, visualizer plates, and cadastral reports.
                  </p>
                </div>

                {/* Dataset Type & Settings */}
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-ink mb-1.5 block">
                    Imagery Dataset Type
                  </Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isBusy}
                    className="h-11 w-full rounded-lg border border-hairlineStrong bg-white px-3.5 text-sm text-ink focus:border-oxblood focus:ring-1 focus:ring-oxblood focus:outline-none"
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Georeferencing Accordion */}
                <div className="border-t border-hairline pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCoords(!showCoords)}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone hover:text-oxblood transition-colors"
                  >
                    <MapPinned size={14} />
                    {showCoords ? "Hide corner GPS coordinates (Optional)" : "+ Add custom corner GPS bounding box (Optional)"}
                  </button>

                  {showCoords && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surfaceSunken/30 rounded-lg border border-hairline animate-slide-up">
                      <Input
                        placeholder="North-East Lat (e.g. 28.6710)"
                        value={neLat}
                        onChange={(e) => setNeLat(e.target.value)}
                        disabled={isBusy}
                      />
                      <Input
                        placeholder="North-East Lng (e.g. 77.4560)"
                        value={neLng}
                        onChange={(e) => setNeLng(e.target.value)}
                        disabled={isBusy}
                      />
                      <Input
                        placeholder="South-West Lat (e.g. 28.6670)"
                        value={swLat}
                        onChange={(e) => setSwLat(e.target.value)}
                        disabled={isBusy}
                      />
                      <Input
                        placeholder="South-West Lng (e.g. 77.4510)"
                        value={swLng}
                        onChange={(e) => setSwLng(e.target.value)}
                        disabled={isBusy}
                      />
                      <p className="col-span-1 sm:col-span-2 text-[11px] text-stoneLight">
                        Leave blank to automatically georeference onto project center coordinates.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!pendingFile || isBusy}
                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold shadow-subtle justify-center"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {stageMessage || "Recognizing Features..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {autoExtract ? "Upload & Extract Features" : "Upload Photo"}
                      </>
                    )}
                  </Button>

                  <Link href={`/projects/${projectId}`} className="w-full sm:w-auto">
                    <Button variant="ghost" size="lg" disabled={isBusy} className="w-full sm:w-auto justify-center">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Real-time Interactive AI Visualizer Overlay directly on the Image */}
          {inspectedDataset && (
            <div className="animate-slide-up space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink text-base flex items-center gap-2">
                  <ScanLine className="text-oxblood" size={18} />
                  Image AI Feature Recognition & Overlay
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectedDataset(null)}
                  className="text-stone hover:text-ink text-xs"
                >
                  Close Visualizer
                </Button>
              </div>

              <ImageAiInspector
                imageryId={inspectedDataset.id}
                imageUrl={inspectedDataset.imageUrl}
                imageFileName={inspectedDataset.fileName}
                detections={inspectedDataset.detections}
                onNavigateToMap={() => router.push(`/projects/${projectId}`)}
              />
            </div>
          )}

          {/* Upload History & Datasets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink text-base">Project Aerial Datasets</h3>
              <span className="text-xs text-stone">{datasets?.length ?? 0} uploaded</span>
            </div>

            {isLoading && (
              <div className="p-6 text-center text-sm text-stone">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-oxblood" />
                Loading datasets...
              </div>
            )}

            {!isLoading && datasets?.length === 0 && (
              <Card className="p-8 text-center bg-surfaceMuted/30 border-dashed">
                <ImageIcon className="h-10 w-10 text-stoneLight mx-auto mb-2 opacity-60" />
                <p className="font-medium text-sm text-ink">No imagery uploaded yet</p>
                <p className="text-xs text-stone mt-1 max-w-sm mx-auto">
                  Upload your first drone photo or satellite image above to start automated AI cadastral mapping.
                </p>
              </Card>
            )}

            <div className="space-y-3.5">
              {datasets?.map((d) => {
                const isProcessed = d.status === "processed";
                const isExtractingThis = extraction.isPending && stage !== "idle";

                return (
                  <div
                    key={d._id}
                    className="rounded-2xl border border-[#EAE6DF] bg-white/90 backdrop-blur-xs p-4 sm:p-5 hover:shadow-lg hover:border-[#7A1E2E]/40 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex items-center gap-4">
                      {/* Image Thumbnail Preview */}
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-zinc-900 border border-[#EAE6DF] shrink-0 shadow-xs group/thumb">
                        <img
                          src={`${API_BASE_URL}/imagery/${d._id}/file`}
                          alt={d.originalFileName}
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <ImageIcon className="h-5 w-5 text-white/80" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#111827] truncate">{d.originalFileName}</p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-mono text-[10px] font-bold bg-[#FAF8F5] text-[#52525B] px-2.5 py-0.5 rounded-md border border-[#EAE6DF]">
                            {TYPE_LABELS[d.type] ?? d.type}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isProcessed
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : d.status === "failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isProcessed ? "✓ PROCESSED & VECTORIZED" : d.status.toUpperCase()}
                          </span>
                          {d.sizeBytes && (
                            <span className="text-[#71717A] text-[11px] font-mono">
                              {(d.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                      {isProcessed ? (
                        <>
                          <button
                            onClick={() => handleInspectDataset(d)}
                            className="flex items-center gap-1.5 bg-[#6D1B28] hover:bg-[#58141F] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5"
                          >
                            <Eye size={13} />
                            <span>Inspect & Compare</span>
                          </button>
                          <a
                            href={`${API_BASE_URL}/exports/imagery/${d._id}/report.pdf`}
                            download={`cadastral-report-${d.originalFileName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
                            onClick={() => toast.info("Downloading Survey PDF", `Generating certificate for ${d.originalFileName}...`)}
                          >
                            <button className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-[#111827] font-semibold text-xs px-3 py-2 rounded-xl border border-[#EAE6DF] shadow-2xs hover:shadow-xs transition-all">
                              <ScanLine size={13} className="text-emerald-600" />
                              <span>PDF Report</span>
                            </button>
                          </a>
                          <button
                            disabled={isBusy}
                            onClick={() => onExtract(d._id, d.originalFileName)}
                            title="Re-run AI extraction"
                            className="p-2 rounded-xl border border-[#EAE6DF] bg-white hover:bg-zinc-50 text-[#52525B] hover:text-[#111827] transition-all disabled:opacity-50"
                          >
                            <RefreshCw size={13} className={isExtractingThis ? "animate-spin text-[#7A1E2E]" : ""} />
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isBusy}
                          onClick={() => onExtract(d._id, d.originalFileName)}
                          className="flex items-center gap-1.5 bg-[#6D1B28] hover:bg-[#58141F] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          {isExtractingThis ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>AI Processing…</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>Run AI Mapping</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        disabled={deleteImagery.isPending || isBusy}
                        onClick={() => {
                          if (window.confirm(`Delete "${d.originalFileName}" and its cadastral analysis records?`)) {
                            deleteImagery.mutate(d._id, {
                              onSuccess: () => {
                                toast.success("Dataset Deleted", `Removed "${d.originalFileName}".`);
                                if (inspectedDataset?.id === d._id) {
                                  setInspectedDataset(null);
                                }
                              },
                            });
                          }
                        }}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 transition-all disabled:opacity-50"
                        title="Delete aerial dataset and analysis"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-stoneLight">
        <Icon size={13} className="text-stone" /> {label}
      </p>
      <p className="text-base font-bold text-ink tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
