import { v } from "convex/values";
import { query, QueryCtx } from "../_generated/server";
import { authenticatedMutation, AuthenticatedQueryCtx } from "./helpers";
import { getServerById } from "./server";
import { getCurrentUser } from "./user";
import { Id } from "../_generated/dataModel";

export const create = authenticatedMutation({
  args: {
    serverId: v.id("servers"),
    expiresAt: v.optional(v.number()),
    maxUses: v.optional(v.number()),
  },
  handler: async (ctx, { serverId, expiresAt, maxUses }) => {
    const inviteId = await ctx.db.insert("invites", {
      serverId,
      expiresAt,
      maxUses,
      uses: 0,
      createdByUserId: ctx.user._id,
    });
    return inviteId;
  },
});

export const get = query({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, { inviteId }) => {
    try {
      const invite = await validateInvite(ctx, inviteId);
      return {
        success: true,
        ...invite,
        server: await getServerById(ctx, invite.serverId),
        createdByUser: await ctx.db.get(invite.createdByUserId),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      } as const;
    }
  },
});

export const join = authenticatedMutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, { inviteId }) => {
    const invite = await validateInvite(ctx, inviteId);
    await ctx.db.insert("serverMembers", {
      serverId: invite.serverId,
      userId: ctx.user._id,
    });
    await ctx.db.patch(inviteId, {
      uses: invite.uses + 1,
    });
  },
});

const validateInvite = async (
  ctx: QueryCtx | AuthenticatedQueryCtx,
  inviteId: Id<"invites">
) => {
  const invite = await ctx.db.get(inviteId);
  if (!invite) {
    throw new Error("Invite not found");
  } else if (invite.maxUses && invite.uses >= invite.maxUses) {
    throw new Error("Invite has reached its maximum usage");
  } else if (invite.expiresAt && invite.expiresAt < Date.now()) {
    throw new Error("Invite has expired");
  }
  const user = await getCurrentUser(ctx);
  if (user) {
    const isMember = await ctx.db
      .query("serverMembers")
      .filter((q) =>
        q.and(
          q.eq(q.field("serverId"), invite.serverId),
          q.eq(q.field("userId"), user._id)
        )
      )
      .first();
    if (isMember) {
      throw new Error("You are already a member of this server");
    }
  }
  return invite;
};

export const remove = authenticatedMutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, { inviteId }) => {
    await ctx.db.delete(inviteId);
  },
});
