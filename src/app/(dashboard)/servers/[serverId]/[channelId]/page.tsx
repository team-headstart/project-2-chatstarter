"use client";

import { use } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Messages } from "@/components/messages";

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: Id<"channels"> }>;
}) {
  const { channelId } = use(params);
  const channel = useQuery(api.functions.channel.get, {
    channelId,
  });

  return (
    <div className="flex flex-1 flex-col divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <h1 className="font-semibold">{channel?.name}</h1>
      </header>
      <Messages channelId={channelId} />
    </div>
  );
}
