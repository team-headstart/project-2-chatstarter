import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { TrashIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { NewChannel } from "./new-channel";

export function ServerSidebar({ serverId }: { serverId: Id<"servers"> }) {
  const user = useQuery(api.functions.user.get);
  const server = useQuery(api.functions.server.get, {
    serverId,
  });
  const channels = useQuery(api.functions.channel.list, {
    serverId,
  });
  const removeChannel = useMutation(api.functions.channel.remove);
  const pathname = usePathname();
  const router = useRouter();

  const handleRemoveChannel = async (channelId: Id<"channels">) => {
    try {
      if (pathname.endsWith(channelId)) {
        router.replace(`/servers/${serverId}/${server?.defaultChannelId}`);
      }
      await removeChannel({ serverId, channelId });
      toast.success("Channel removed");
    } catch (error) {
      toast.error("Failed to remove channel");
    }
  };
  return (
    <Sidebar className="left-12">
      <SidebarHeader className="py-4">
        <h1 className="font-semibold">{server?.name}</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          {user?._id === server?.ownerId && <NewChannel serverId={serverId} />}
          <SidebarGroupContent>
            <SidebarMenu>
              {channels?.map((channel) => (
                <SidebarMenuItem key={channel._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === `/servers/${serverId}/${channel._id}`
                    }
                  >
                    <Link href={`/servers/${serverId}/${channel._id}`}>
                      {channel.name}
                    </Link>
                  </SidebarMenuButton>
                  {user?._id === server?.ownerId && (
                    <SidebarMenuAction
                      onClick={() => handleRemoveChannel(channel._id)}
                    >
                      <TrashIcon />
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
