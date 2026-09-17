"use client";

import { useProject } from "@/features/projects/hooks";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

const STAGE_LABELS: Record<string, string> = {
  created: "Survey Active",
  imagery_uploaded: "Aerial Imagery Loaded",
  ortho_generated: "Orthomosaic Stitched",
  ai_extraction: "AI Mapping Active",
  topology_validation: "Topology Verified",
  field_verification: "Field Verified",
  approved: "Certified Cadastre",
};

export function ProjectTopBar({ projectId, title }: { projectId: string; title: string }) {
  const { data: project } = useProject(projectId);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-surface px-8">
      <div>
        <p className="text-xs text-stoneLight">{project?.name ?? "…"}</p>
        <h1 className="text-lg font-semibold text-ink leading-tight">{title}</h1>
      </div>
      {project && (
        <div className="flex items-center gap-4">
          <div className="w-36">
            <ProgressBar value={project.progressPercent} />
          </div>
          <Badge tone={project.currentStage === "approved" ? "moss" : "oxblood"}>
            {STAGE_LABELS[project.currentStage] ?? project.currentStage}
          </Badge>
        </div>
      )}
    </header>
  );
}
