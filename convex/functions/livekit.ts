import { v } from "convex/values";
import { AccessToken } from "livekit-server-sdk";
import { Id } from "../_generated/dataModel";
import {
  authenticatedMutation,
  authenticatedQuery,
  AuthenticatedQueryCtx,
} from "./helpers";
import { assertServerMember } from "./server";
import { mutation } from "../_generated/server";

export const getToken = authenticatedQuery({
  args: {
    serverId: v.id("servers"),
  },
  handler: async (ctx, { serverId }) => {
    await assertServerMember(ctx, serverId);
    return await createToken(ctx, serverId);
  },
});

export const setMemberState = authenticatedMutation({
  args: {
    serverId: v.id("servers"),
    audioEnabled: v.boolean(),
    videoEnabled: v.boolean(),
  },
  handler: async (ctx, { serverId, audioEnabled, videoEnabled }) => {
    const member = await assertServerMember(ctx, serverId);
    await ctx.db.patch(member._id, {
      audioEnabled,
      videoEnabled,
    });
  },
});

const createToken = async (
  ctx: AuthenticatedQueryCtx,
  serverId: Id<"servers">
) => {
  if (!process.env.LIVEKIT_API_KEY) {
    throw new Error("LIVEKIT_API_KEY is not set");
  } else if (!process.env.LIVEKIT_API_SECRET) {
    throw new Error("LIVEKIT_API_SECRET is not set");
  }
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: ctx.user.username,
    }
  );
  token.addGrant({
    room: serverId,
    roomJoin: true,
  });
  return await token.toJwt();
};
