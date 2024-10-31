import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useMutation } from "convex/react";
import { ImageIcon, PlusIcon } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewServer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const image = useImageUpload();
  const createServer = useMutation(api.functions.server.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { serverId, defaultChannelId } = await createServer({
        name,
        icon: image.storageId,
      });
      toast.success("Server created");
      router.push(`/servers/${serverId}/${defaultChannelId}`);
    } catch (error) {
      toast.error("Failed to create server", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Create Server">
            <PlusIcon />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Icon</Label>
            <div className="flex items-center gap-2">
              <input {...image.inputProps} />
              <Avatar>
                {image.previewUrl && <AvatarImage src={image.previewUrl} />}
                <AvatarFallback>
                  <ImageIcon />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={image.open}
              >
                {image.uploading ? "Uploading..." : "Choose Icon"}
              </Button>
              {image.previewUrl && (
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  onClick={image.remove}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
