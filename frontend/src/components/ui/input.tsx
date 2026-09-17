import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-11 w-full rounded border border-hairlineStrong bg-white px-3 text-base text-ink placeholder:text-stoneLight",
        "focus:border-oxblood focus:outline-none focus:ring-2 focus:ring-oxblood/15",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={clsx("block text-sm font-medium text-ink mb-1.5", className)}>
      {children}
    </label>
  );
}
