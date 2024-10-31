import "@livekit/components-styles";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LiveKitRoom,
  useLocalParticipant,
  VideoConference,
} from "@livekit/components-react";
import { useMutation, useQuery } from "convex/react";
import {
  CameraIcon,
  CheckIcon,
  Loader2Icon,
  LogInIcon,
  PhoneIcon,
} from "lucide-react";
import { useEffect } from "react";
import { create } from "zustand";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface RoomState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  dialogOpen: boolean;
  connected: boolean;
  setAudioEnabled: (audioEnabled: boolean) => void;
  setVideoEnabled: (videoEnabled: boolean) => void;
  setDialogOpen: (dialogOpen: boolean) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

const useRoomState = create<RoomState>((set) => ({
  audioEnabled: false,
  videoEnabled: false,
  dialogOpen: false,
  connected: false,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setVideoEnabled: (videoEnabled) => set({ videoEnabled }),
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
  onConnected: () => set({ connected: true }),
  onDisconnected: () =>
    set({
      audioEnabled: false,
      videoEnabled: false,
      dialogOpen: false,
      connected: false,
    }),
}));

export function Voice({ serverId }: { serverId: Id<"servers"> }) {
  const token = useQuery(api.functions.livekit.getToken, { serverId });
  const connect = useRoomState(
    (state) => state.audioEnabled || state.videoEnabled || state.dialogOpen
  );
  const onConnected = useRoomState((state) => state.onConnected);
  const onDisconnected = useRoomState((state) => state.onDisconnected);

  return (
    <LiveKitRoom
      className="contents"
      token={token}
      serverUrl="wss://discord-g4yeckkt.livekit.cloud"
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      connect={connect}
    >
      <VoiceControls />
      <VoiceDialog />
      <SynchronizeVoiceState serverId={serverId} />
    </LiveKitRoom>
  );
}

function VoiceControls() {
  const audioEnabled = useRoomState((state) => state.audioEnabled);
  const videoEnabled = useRoomState((state) => state.videoEnabled);
  const setAudioEnabled = useRoomState((state) => state.setAudioEnabled);
  const setVideoEnabled = useRoomState((state) => state.setVideoEnabled);
  const setDialogOpen = useRoomState((state) => state.setDialogOpen);
  const connected = useRoomState((state) => state.connected);

  return (
    <SidebarFooter>
      <SidebarGroup>
        <SidebarGroupLabel>Voice</SidebarGroupLabel>
        <SidebarGroupAction onClick={() => setDialogOpen(true)}>
          <LogInIcon />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setAudioEnabled(!audioEnabled)}
                isActive={audioEnabled}
              >
                <PhoneIcon />
                Audio
                {audioEnabled && (
                  <SidebarMenuBadge>
                    {connected ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuButton>
              <SidebarMenuButton
                onClick={() => setVideoEnabled(!videoEnabled)}
                isActive={videoEnabled}
              >
                <CameraIcon />
                Video
                {videoEnabled && (
                  <SidebarMenuBadge>
                    {connected ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <Loader2Icon className="size-4 animate-spin" />
                    )}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarFooter>
  );
}

function VoiceDialog() {
  const dialogOpen = useRoomState((state) => state.dialogOpen);
  const setDialogOpen = useRoomState((state) => state.setDialogOpen);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-[calc(100%-2.5rem)] h-[calc(100%-2.5rem)]">
        <DialogTitle className="sr-only">Voice</DialogTitle>
        <VideoConference />
      </DialogContent>
    </Dialog>
  );
}

function SynchronizeVoiceState({ serverId }: { serverId: Id<"servers"> }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const connected = useRoomState((state) => state.connected);
  const audioEnabled = useRoomState((state) => state.audioEnabled);
  const videoEnabled = useRoomState((state) => state.videoEnabled);
  const setAudioEnabled = useRoomState((state) => state.setAudioEnabled);
  const setVideoEnabled = useRoomState((state) => state.setVideoEnabled);
  const setMemberState = useMutation(api.functions.livekit.setMemberState);

  useEffect(() => {
    if (connected) {
      localParticipant.setMicrophoneEnabled(audioEnabled);
    }
  }, [audioEnabled, connected]);

  useEffect(() => {
    setAudioEnabled(isMicrophoneEnabled);
  }, [isMicrophoneEnabled]);

  useEffect(() => {
    if (connected) {
      localParticipant.setCameraEnabled(videoEnabled);
    }
  }, [videoEnabled, connected]);

  useEffect(() => {
    setVideoEnabled(isCameraEnabled);
  }, [isCameraEnabled]);

  useEffect(() => {
    setMemberState({
      serverId,
      audioEnabled,
      videoEnabled,
    });
  }, [audioEnabled, videoEnabled]);

  return null;
}
