export type Role = "admin" | "project_manager" | "gis_analyst" | "surveyor" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: Role;
  organization?: string;
  organizationId?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  city?: string;
  ward?: string;
  currentStage: string;
  progressPercent: number;
  checkpoints: { stage: string; completed: boolean; completedAt: string | null }[];
  createdAt: string;
}

export interface ImageryDataset {
  _id: string;
  project: string;
  originalFileName: string;
  type: "drone_rgb" | "orthomosaic" | "dsm" | "dtm";
  status: "uploaded" | "validated" | "processing" | "processed" | "failed";
  boundingBox?: { northEast: number[]; southWest: number[] };
  sizeBytes?: number;
  groundResolutionCm?: number | null;
  widthPx: number | null;
  heightPx: number | null;
  aiDetections?: {
    buildings: any[];
    roads: any[];
    landUseZones: any[];
    notes?: string;
  };
  createdAt: string;
}

export interface ParcelProperties {
  id: string;
  parcelCode: string;
  landUse: string | null;
  status: string;
  aiConfidence: number | null;
  areaSqm: number | null;
}

export interface ExtractionSummary {
  totalBuildingsDetected: number;
  totalRoadsDetected: number;
  totalParcelsExtracted: number;
  roadLengthM: number;
  inferenceTimeMs: number;
  aiNotes: string;
}

export interface TopologyIssue {
  type: "overlap" | "gap" | "self_intersection" | "invalid_geometry" | "duplicate_boundary";
  parcelIds: string[];
  description: string;
  severity: "low" | "medium" | "high";
}

export interface TopologyReport {
  _id: string;
  project: string;
  parcelsChecked: number;
  issues: TopologyIssue[];
  overlapCount: number;
  gapCount: number;
  invalidGeometryCount: number;
  duplicateCount: number;
  passed: boolean;
  createdAt: string;
}
