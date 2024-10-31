"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { use } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ServerSidebar } from "./_components/server-sidebar";
import { MembersList } from "./_components/members-list";

export default function ServersLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    serverId: Id<"servers">;
  }>;
}) {
  const { serverId } = use(params);

  return (
    <SidebarProvider>
      <ServerSidebar serverId={serverId} />
      {children}
      <MembersList serverId={serverId} />
    </SidebarProvider>
  );
}
