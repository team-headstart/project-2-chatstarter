import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const list = authenticatedQuery({
  args: {
    channelId: v.union(v.id("channels"), v.id("directMessages")),
  },
  handler: async (ctx, { channelId }) => {
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
      .filter((q) => q.neq(q.field("user"), ctx.user._id))
      .collect();
    return await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);
        if (!user) {
          throw new Error("User does not exist.");
        }
        return user.username;
      })
    );
  },
});

export const upsert = authenticatedMutation({
  args: {
    channelId: v.union(v.id("channels"), v.id("directMessages")),
  },
  handler: async (ctx, { channelId }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_channelId", (q) =>
        q.eq("user", ctx.user._id).eq("channelId", channelId)
      )
      .unique();
    const expiresAt = Date.now() + 5000;
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert("typingIndicators", {
        user: ctx.user._id,
        channelId,
        expiresAt,
      });
    }
    await ctx.scheduler.runAt(expiresAt, internal.functions.typing.remove, {
      channelId,
      user: ctx.user._id,
      expiresAt,
    });
  },
});

export const remove = internalMutation({
  args: {
    channelId: v.union(v.id("channels"), v.id("directMessages")),
    user: v.id("users"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { channelId, user, expiresAt }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_channelId", (q) =>
        q.eq("user", user).eq("channelId", channelId)
      )
      .unique();
    if (existing && (!expiresAt || existing.expiresAt === expiresAt)) {
      await ctx.db.delete(existing._id);
    }
  },
});
