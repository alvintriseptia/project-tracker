import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={twMerge(
        "rounded-2xl border border-line bg-surface p-5 shadow-[0_10px_30px_rgba(23,35,28,0.05)]",
        className,
      )}
      {...props}
    />
  );
}
