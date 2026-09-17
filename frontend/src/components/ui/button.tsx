import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
          size === "lg" ? "h-12 px-6 text-base font-semibold" : size === "md" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm",
          variant === "primary" && "bg-oxblood text-white hover:bg-oxblood-dark",
          variant === "secondary" &&
            "bg-surface text-ink border border-hairlineStrong hover:border-ink/40 hover:bg-surfaceSunken",
          variant === "ghost" && "text-ink hover:bg-surfaceSunken",
          variant === "danger" && "bg-white text-oxblood border border-oxblood/40 hover:bg-oxblood-tint",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
