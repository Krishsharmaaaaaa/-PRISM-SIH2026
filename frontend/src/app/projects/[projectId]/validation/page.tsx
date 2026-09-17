"use client";

import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { ProjectTopBar } from "@/components/layout/project-topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLatestTopologyReport } from "@/features/gis/hooks";
import { api } from "@/lib/api";

const ISSUE_LABELS: Record<string, string> = {
  overlap: "Two parcels overlap",
  gap: "Un-mapped gap between parcels",
  self_intersection: "Boundary crosses itself",
  invalid_geometry: "Boundary shape is broken",
  duplicate_boundary: "Duplicate parcel boundary",
};

const SEVERITY_TONE: Record<string, any> = { high: "oxblood", medium: "amber", low: "neutral" };

export default function ValidationPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { data: report, isLoading } = useLatestTopologyReport(projectId);

  const runValidation = useMutation({
    mutationFn: () => api.post(`/topology/projects/${projectId}/validate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topology-latest", projectId] }),
  });

  return (
    <div className="flex h-screen flex-col">
      <ProjectTopBar projectId={projectId} title="Boundary checks" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8 space-y-6">
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <ShieldCheck size={18} className="text-oxblood" /> Check parcel boundaries
                </p>
                <p className="text-sm text-stone mt-1">
                  Finds parcels that overlap, cross themselves, are missing land, or were drawn twice.
                </p>
              </div>
              <Button onClick={() => runValidation.mutate()} disabled={runValidation.isPending}>
                <RefreshCw size={16} className={runValidation.isPending ? "animate-spin" : ""} />
                {runValidation.isPending ? "Checking…" : "Run check"}
              </Button>
            </CardBody>
          </Card>

          {isLoading && <p className="text-stone text-sm">Loading last results…</p>}

          {report && (
            <>
              <div className="grid grid-cols-4 gap-3">
                <StatBox label="Parcels checked" value={report.parcelsChecked} />
                <StatBox label="Overlaps" value={report.overlapCount} warn={report.overlapCount > 0} />
                <StatBox label="Gaps" value={report.gapCount} warn={report.gapCount > 0} />
                <StatBox label="Broken shapes" value={report.invalidGeometryCount} warn={report.invalidGeometryCount > 0} />
              </div>

              {report.passed ? (
                <Card className="p-5 flex items-center gap-3 border-moss/30 bg-moss-tint">
                  <CheckCircle2 className="text-moss" size={22} />
                  <p className="text-sm text-ink">No problems found. These boundaries are ready for field checking.</p>
                </Card>
              ) : (
                <div>
                  <h3 className="font-semibold mb-3">Issues to look into</h3>
                  <div className="space-y-2">
                    {report.issues.map((issue, i) => (
                      <Card key={i} className="p-4 flex items-start gap-3">
                        <AlertTriangle size={17} className="text-amber mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{ISSUE_LABELS[issue.type] ?? issue.type}</p>
                            <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
                          </div>
                          <p className="text-sm text-stone">{issue.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!isLoading && !report && (
            <p className="text-stone text-sm">No check has been run yet for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-stoneLight">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${warn ? "text-oxblood" : "text-ink"}`}>{value}</p>
    </Card>
  );
}
