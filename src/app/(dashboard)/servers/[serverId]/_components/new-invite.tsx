import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const expiresAtOptions = [
  { label: "Never", value: 0 },
  { label: "1 Hour", value: 60 * 60 * 1000 },
  { label: "1 Day", value: 24 * 60 * 60 * 1000 },
  { label: "1 Week", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "1 Month", value: 30 * 24 * 60 * 60 * 1000 },
];

const maxUsesOptions = [
  { label: "No Limit", value: 0 },
  { label: "1", value: 1 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
];

export function NewInvite({ serverId }: { serverId: Id<"servers"> }) {
  const createInvite = useMutation(api.functions.invite.create);
  const [inviteId, setInviteId] = useState<Id<"invites">>();

  const handleSubmit = async (expiresAt: number, maxUses: number) => {
    const invite = await createInvite({
      serverId,
      expiresAt: expiresAt === 0 ? undefined : expiresAt,
      maxUses: maxUses === 0 ? undefined : maxUses,
    });
    setInviteId(invite);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Invite Friends
        </Button>
      </DialogTrigger>
      {inviteId ? (
        <InviteLink inviteId={inviteId} onBack={() => setInviteId(undefined)} />
      ) : (
        <NewInviteForm onSubmit={handleSubmit} />
      )}
    </Dialog>
  );
}

function NewInviteForm({
  onSubmit,
}: {
  onSubmit: (expiresAt: number, maxUses: number) => void;
}) {
  const [expiresAt, setExpiresAt] = useState<number>(expiresAtOptions[0].value);
  const [maxUses, setMaxUses] = useState<number>(maxUsesOptions[0].value);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Friends</DialogTitle>
      </DialogHeader>
      <form
        className="contents"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(expiresAt, maxUses);
        }}
      >
        <div className="flex flex-col gap-2">
          <Label>Expires At</Label>
          <Select
            value={expiresAt.toString()}
            onValueChange={(value) => setExpiresAt(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Expires At" />
            </SelectTrigger>
            <SelectContent>
              {expiresAtOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Max Uses</Label>
          <Select
            value={maxUses.toString()}
            onValueChange={(value) => setMaxUses(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Max Uses" />
            </SelectTrigger>
            <SelectContent>
              {maxUsesOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit">Create Invite</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function InviteLink({
  inviteId,
  onBack,
}: {
  inviteId: Id<"invites">;
  onBack: () => void;
}) {
  const url = `${window.location.origin}/invite/${inviteId}`;
  const [copied, setCopied] = useState(false);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Link</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor="invite-link" className="sr-only">
          Invite Link
        </Label>
        <div className="flex items-center gap-2">
          <Input id="invite-link" value={url} readOnly />
          <Button
            className={cn(copied && "bg-green-500")}
            variant="outline"
            onClick={() => {
              setCopied(true);
              navigator.clipboard.writeText(url);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
