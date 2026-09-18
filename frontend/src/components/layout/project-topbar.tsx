"use client";

import { Menu } from "lucide-react";
import { useProject } from "@/features/projects/hooks";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useSidebarContext } from "./sidebar-context";

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
  const { toggleMobile } = useSidebarContext();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surfaceMuted/50 text-ink hover:bg-surfaceSunken transition-colors shrink-0 shadow-2xs"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-stoneLight truncate">{project?.name ?? "…"}</p>
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-ink leading-tight truncate">{title}</h1>
        </div>
      </div>
      {project && (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:block w-24 md:w-36">
            <ProgressBar value={project.progressPercent} />
          </div>
          <Badge tone={project.currentStage === "approved" ? "moss" : "oxblood"} className="text-[11px] sm:text-xs whitespace-nowrap">
            {STAGE_LABELS[project.currentStage] ?? project.currentStage}
          </Badge>
        </div>
      )}
    </header>
  );
}

