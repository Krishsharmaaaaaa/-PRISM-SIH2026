import clsx from "clsx";

const TONES = {
  neutral: "bg-surfaceSunken text-stone border-hairlineStrong",
  oxblood: "bg-oxblood-tint text-oxblood-dark border-oxblood/20",
  moss: "bg-moss-tint text-moss border-moss/20",
  amber: "bg-amber-tint text-amber border-amber/20",
  slate: "bg-slateblue-tint text-slateblue border-slateblue/20",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
