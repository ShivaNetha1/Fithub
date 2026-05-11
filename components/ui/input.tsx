import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[#b7e4d5]",
        className
      )}
      {...props}
    />
  );
}
