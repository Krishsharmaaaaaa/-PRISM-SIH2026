"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CheckCircle2, AlertTriangle, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ParcelProperties } from "@/lib/types";

const STATUS_TONE: Record<string, any> = {
  ai_generated: "amber",
  under_review: "slate",
  field_verified: "moss",
  approved: "moss",
  rejected: "oxblood",
};

const STATUS_LABEL: Record<string, string> = {
  ai_generated: "AI suggested — not checked yet",
  under_review: "Being reviewed",
  field_verified: "Checked in the field",
  approved: "Approved",
  rejected: "Rejected",
};

export function ParcelInspector({
  parcel,
  onClose,
  projectId,
}: {
  parcel: ParcelProperties;
  onClose: () => void;
  projectId: string;
}) {
  const queryClient = useQueryClient();

  const approve = useMutation({
    mutationFn: (status: string) => api.patch(`/gis/parcels/${parcel.id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parcels", projectId] }),
  });

  return (
    <Card className="absolute right-6 top-6 z-10 w-80 shadow-float animate-slide-up">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <p className="text-xs text-stoneLight">Parcel</p>
          <p className="font-mono text-sm font-semibold">{parcel.parcelCode}</p>
        </div>
        <button onClick={onClose} className="text-stone hover:text-ink">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <Badge tone={STATUS_TONE[parcel.status] ?? "neutral"}>
          {STATUS_LABEL[parcel.status] ?? parcel.status}
        </Badge>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-stoneLight text-xs">Land use</p>
            <p className="font-medium capitalize">{parcel.landUse?.replace("_", " ") ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-stoneLight text-xs flex items-center gap-1">
              <Ruler size={12} /> Area
            </p>
            <p className="font-medium">{parcel.areaSqm ? `${parcel.areaSqm.toFixed(0)} m²` : "—"}</p>
          </div>
        </div>

        {parcel.aiConfidence !== null && (
          <div>
            <p className="text-stoneLight text-xs mb-1">How sure the AI was</p>
            <div className="h-1.5 w-full rounded-full bg-surfaceSunken overflow-hidden">
              <div
                className="h-full rounded-full bg-amber"
                style={{ width: `${(parcel.aiConfidence ?? 0) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-stone">{Math.round((parcel.aiConfidence ?? 0) * 100)}% confident</p>
          </div>
        )}

        {parcel.status === "ai_generated" && (
          <div className="rounded border border-amber/30 bg-amber-tint px-3 py-2 text-xs text-amber flex gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            This boundary was drawn by AI and still needs a person to check it on the ground.
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => approve.mutate("field_verified")}
            disabled={approve.isPending}
          >
            <CheckCircle2 size={15} />
            Mark checked
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => approve.mutate("approved")}
            disabled={approve.isPending}
          >
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}
