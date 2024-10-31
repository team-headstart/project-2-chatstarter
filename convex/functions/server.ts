import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import {
  authenticatedMutation,
  authenticatedQuery,
  AuthenticatedQueryCtx,
} from "./helpers";

export const list = authenticatedQuery({
  handler: async (ctx) => {
    const userServers = await ctx.db
      .query("serverMembers")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
    const servers = await Promise.allSettled(
      userServers.map((server) => getServerById(ctx, server.serverId))
    );
    return servers
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
  },
});

export const get = authenticatedQuery({
  args: { serverId: v.id("servers") },
  handler: async (ctx, { serverId }) => {
    await assertServerMember(ctx, serverId);
    return await getServerById(ctx, serverId);
  },
});

export const members = authenticatedQuery({
  args: { serverId: v.id("servers") },
  handler: async (ctx, { serverId }) => {
    await assertServerMember(ctx, serverId);
    const members = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .collect();
    const users = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) {
          return null;
        }
        return {
          ...user,
          audioEnabled: member.audioEnabled,
          videoEnabled: member.videoEnabled,
        };
      })
    );
    return users.filter((user) => user !== null);
  },
});

export const create = authenticatedMutation({
  args: {
    name: v.string(),
    icon: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { name, icon }) => {
    const serverId = await ctx.db.insert("servers", {
      name,
      icon,
      ownerId: ctx.user._id,
    });
    const defaultChannelId = await ctx.db.insert("channels", {
      name: "general",
      serverId,
    });
    await ctx.db.insert("serverMembers", {
      serverId,
      userId: ctx.user._id,
    });
    await ctx.db.patch(serverId, {
      defaultChannelId,
    });
    return { serverId, defaultChannelId };
  },
});

export const remove = authenticatedMutation({
  args: { serverId: v.id("servers") },
  handler: async (ctx, { serverId }) => {
    await assertServerOwner(ctx, serverId);
    await ctx.db.delete(serverId);
  },
});

export const leave = authenticatedMutation({
  args: { serverId: v.id("servers") },
  handler: async (ctx, { serverId }) => {
    const server = await ctx.db.get(serverId);
    if (!server) {
      throw new Error("Server not found");
    } else if (server.ownerId === ctx.user._id) {
      throw new Error("You cannot leave your own server");
    }
    const member = await ctx.db
      .query("serverMembers")
      .withIndex("by_serverId_userId", (q) =>
        q.eq("serverId", serverId).eq("userId", ctx.user._id)
      )
      .unique();
    if (!member) {
      throw new Error("You are not a member of this server");
    }
    await ctx.db.delete(member._id);
  },
});

export const getServerById = async (ctx: QueryCtx, serverId: Id<"servers">) => {
  const server = await ctx.db.get(serverId);
  if (!server) {
    throw new Error("Server not found");
  }
  return {
    ...server,
    icon: server.icon ? await ctx.storage.getUrl(server.icon) : null,
  };
};

export const assertServerOwner = async (
  ctx: AuthenticatedQueryCtx,
  serverId: Id<"servers">
) => {
  const server = await ctx.db.get(serverId);
  if (!server) {
    throw new Error("Server not found");
  } else if (server.ownerId !== ctx.user._id) {
    throw new Error("You are not the owner of this server");
  }
};

export const assertServerMember = async (
  ctx: AuthenticatedQueryCtx,
  serverId: Id<"servers">
) => {
  const member = await ctx.db
    .query("serverMembers")
    .withIndex("by_serverId_userId", (q) =>
      q.eq("serverId", serverId).eq("userId", ctx.user._id)
    )
    .unique();
  if (!member) {
    throw new Error("You are not a member of this server");
  }
  return member;
};
