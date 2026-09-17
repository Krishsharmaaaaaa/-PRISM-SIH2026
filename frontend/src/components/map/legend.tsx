import { Card } from "@/components/ui/card";

const LAND_USE_COLORS: Record<string, string> = {
  residential: "#3A5166",
  commercial: "#8A6A1F",
  industrial: "#6E6A63",
  mixed_use: "#7A2331",
  vacant: "#9C978E",
  public_utility: "#3F6B4F",
  open_space: "#5E8A6B",
};

export function MapLegend() {
  return (
    <Card className="w-56 shadow-float">
      <div className="border-b border-hairline px-4 py-2.5">
        <p className="text-sm font-semibold">Land use</p>
      </div>
      <div className="p-3 space-y-1.5">
        {Object.entries(LAND_USE_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-ink">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="capitalize">{key.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { LAND_USE_COLORS };
