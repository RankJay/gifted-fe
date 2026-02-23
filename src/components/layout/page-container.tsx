import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className="flex min-h-screen items-start pt-10 justify-center bg-[#F2F2F2]">
      <div className={cn("w-full max-w-sm px-4", className)}>{children}</div>
    </div>
  );
}
