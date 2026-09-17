export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-surfaceSunken overflow-hidden">
      <div
        className="h-full rounded-full bg-oxblood transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
