"use client";

import { Layers, Building2, Route, Hexagon, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface LayerState {
  parcels: boolean;
  buildings: boolean;
  roads: boolean;
  satellite: boolean;
}

const ROWS: { key: keyof LayerState; label: string; icon: any; swatch: string }[] = [
  { key: "parcels", label: "Parcel boundaries", icon: Hexagon, swatch: "bg-oxblood" },
  { key: "buildings", label: "Buildings", icon: Building2, swatch: "bg-slateblue" },
  { key: "roads", label: "Roads & paths", icon: Route, swatch: "bg-amber" },
];

export function LayersPanel({
  layers,
  onToggle,
  mapType,
  onMapTypeChange,
}: {
  layers: LayerState;
  onToggle: (key: keyof LayerState) => void;
  mapType: "satellite" | "roadmap";
  onMapTypeChange: (t: "satellite" | "roadmap") => void;
}) {
  return (
    <Card className="w-64 shadow-float">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
        <Layers size={16} strokeWidth={1.75} className="text-stone" />
        <p className="text-sm font-semibold">Map layers</p>
      </div>
      <div className="p-3 space-y-1">
        {ROWS.map((row) => (
          <label
            key={row.key}
            className="flex items-center gap-2.5 rounded px-2 py-2 hover:bg-surfaceSunken cursor-pointer"
          >
            <input
              type="checkbox"
              checked={layers[row.key]}
              onChange={() => onToggle(row.key)}
              className="h-4 w-4 accent-oxblood"
            />
            <span className={`h-2.5 w-2.5 rounded-sm ${row.swatch}`} />
            <span className="text-sm text-ink">{row.label}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-hairline p-3">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stoneLight">
          <ImageIcon size={13} /> Base map
        </p>
        <div className="flex rounded border border-hairlineStrong overflow-hidden text-sm">
          <button
            className={`flex-1 py-1.5 ${mapType === "satellite" ? "bg-oxblood text-white" : "bg-white text-ink"}`}
            onClick={() => onMapTypeChange("satellite")}
          >
            Satellite
          </button>
          <button
            className={`flex-1 py-1.5 ${mapType === "roadmap" ? "bg-oxblood text-white" : "bg-white text-ink"}`}
            onClick={() => onMapTypeChange("roadmap")}
          >
            Map
          </button>
        </div>
      </div>
    </Card>
  );
}
