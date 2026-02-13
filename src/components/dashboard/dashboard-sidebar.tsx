"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar } from "lucide-react";
import { useRequiredDashboardContext } from "@/hooks/use-required-dashboard-context";
import { formatAmount, formatDate } from "@/lib/format";

export function DashboardSidebar() {
  const {
    state: { giftCards },
  } = useRequiredDashboardContext();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Gift className="size-5" />
          <span className="font-semibold">Gift Cards</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Gift Cards</SidebarGroupLabel>
          <SidebarGroupContent>
            {giftCards.length === 0 ? (
              <Empty className="border-0">
                <EmptyMedia variant="icon">
                  <Gift className="size-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No gift cards yet</EmptyTitle>
                  <EmptyDescription>Create your first gift card to see it here</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <SidebarMenu>
                {giftCards.map((card) => (
                  <SidebarMenuItem key={card.id}>
                    <SidebarMenuButton className="group relative flex flex-col items-start gap-1.5 p-3 h-auto">
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Gift className="size-4 shrink-0 text-muted-foreground" />
                          <span className="font-medium truncate">${formatAmount(card.amount)}</span>
                          <Badge variant="outline" className="shrink-0">
                            {card.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{formatDate(card.createdAt)}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
