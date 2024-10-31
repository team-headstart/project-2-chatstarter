import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { assertServerMember, assertServerOwner } from "./server";

export const list = authenticatedQuery({
  args: { serverId: v.id("servers") },
  handler: async (ctx, { serverId }) => {
    await assertServerMember(ctx, serverId);
    return await ctx.db
      .query("channels")
      .withIndex("by_serverId", (q) => q.eq("serverId", serverId))
      .collect();
  },
});

export const get = authenticatedQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    const channel = await ctx.db.get(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    await assertServerMember(ctx, channel.serverId);
    return channel;
  },
});

export const create = authenticatedMutation({
  args: { serverId: v.id("servers"), name: v.string() },
  handler: async (ctx, { serverId, name }) => {
    await assertServerOwner(ctx, serverId);
    return await ctx.db.insert("channels", {
      name,
      serverId,
    });
  },
});

export const remove = authenticatedMutation({
  args: { serverId: v.id("servers"), channelId: v.id("channels") },
  handler: async (ctx, { serverId, channelId }) => {
    const server = await ctx.db.get(serverId);
    if (!server) {
      throw new Error("Server not found");
    } else if (server.ownerId !== ctx.user._id) {
      throw new Error("You are not the owner of this server");
    } else if (server.defaultChannelId === channelId) {
      throw new Error("You cannot delete the default channel");
    }
    await ctx.db.delete(channelId);
  },
});
