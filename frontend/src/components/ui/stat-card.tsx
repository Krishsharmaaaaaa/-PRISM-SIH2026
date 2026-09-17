import { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-stoneLight">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded bg-oxblood-tint text-oxblood">
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </Card>
  );
}
