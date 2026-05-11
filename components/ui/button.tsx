import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[#0f6853]",
  secondary:
    "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-strong)]",
  danger: "bg-[var(--danger)] text-white hover:bg-[#8f1d15]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--panel-strong)]"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
}
