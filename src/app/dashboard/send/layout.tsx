import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

export default function SendLayout({ children }: { children: ReactNode }) {
  return <PageContainer>{children}</PageContainer>;
}
