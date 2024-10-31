"use client";

import { use } from "react";
import { api } from "../../../../convex/_generated/api";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { LoaderIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: Id<"invites"> }>;
}) {
  const { id } = use(params);
  const invite = useQuery(api.functions.invite.get, { inviteId: id });
  const join = useMutation(api.functions.invite.join);
  const router = useRouter();
  const pathname = usePathname();

  if (invite === undefined) {
    return <LoaderIcon className="animate-spin" />;
  }
  if (!invite.success) {
    return (
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Invalid Invite</CardTitle>
          <CardDescription>{invite.message}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" size="sm" asChild>
            <Link href="/dms">Back</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Join {invite.server.name}</CardTitle>
        <CardDescription>
          {invite.createdByUser?.username} invited you to join{" "}
          {invite.server.name}.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <Authenticated>
          <Button
            size="sm"
            onClick={async () => {
              await join({ inviteId: id });
              router.push(
                `/servers/${invite.serverId}/${invite.server.defaultChannelId}`
              );
            }}
          >
            Join
          </Button>
        </Authenticated>
        <Unauthenticated>
          <Button size="sm" asChild>
            <SignInButton forceRedirectUrl={pathname}>
              Sign in to Join
            </SignInButton>
          </Button>
        </Unauthenticated>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dms">Not Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
