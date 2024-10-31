import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { NewServer } from "./new-server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RootSidebar() {
  const pathname = usePathname();
  const servers = useQuery(api.functions.server.list);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Direct Messages"
                isActive={pathname.startsWith("/dms")}
                asChild
              >
                <Link href="/dms">
                  <UserIcon />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {servers?.map((server) => (
              <SidebarMenuItem key={server._id}>
                <SidebarMenuButton
                  className="relative overflow-clip"
                  tooltip={server.name}
                  isActive={pathname.startsWith(`/servers/${server._id}`)}
                  asChild
                >
                  <Link
                    href={`/servers/${server._id}/${server.defaultChannelId}`}
                  >
                    <Avatar className="size-8 absolute inset-0 rounded-none">
                      {server.icon && <AvatarImage src={server.icon} />}
                      <AvatarFallback>{server.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <NewServer />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
