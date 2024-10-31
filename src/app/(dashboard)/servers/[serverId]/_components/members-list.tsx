import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { NewInvite } from "./new-invite";

export function MembersList({ serverId }: { serverId: Id<"servers"> }) {
  const members = useQuery(api.functions.server.members, {
    serverId,
  });
  return (
    <div className="w-64 border-l p-2 bg-muted">
      {members?.map((member) => (
        <div
          key={member._id}
          className="flex items-center justify-between p-2.5 gap-2.5"
        >
          <div className="flex items-center gap-2 5">
            <Avatar className="size-8 border">
              <AvatarImage src={member.image} />
              <AvatarFallback />
            </Avatar>
            <p className="text-sm font-medium">{member.username}</p>
          </div>
        </div>
      ))}
      <NewInvite serverId={serverId} />
    </div>
  );
}
