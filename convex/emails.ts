import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("emails")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("emails")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", identity.subject).eq("status", args.status)
      )
      .order("desc")
      .collect();
  },
});

export const listByContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("by_contactId", (q) => q.eq("contactId", args.contactId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    htmlBody: v.optional(v.string()),
    template: v.optional(
      v.union(
        v.literal("meeting_request"),
        v.literal("task_assignment"),
        v.literal("campaign"),
        v.literal("follow_up"),
        v.literal("custom")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return await ctx.db.insert("emails", {
      userId: identity.subject,
      contactId: args.contactId,
      companyId: args.companyId,
      to: args.to,
      from: user?.email || "",
      fromName: user?.name,
      subject: args.subject,
      body: args.body,
      htmlBody: args.htmlBody,
      status: "draft",
      template: args.template,
      createdAt: Date.now(),
    });
  },
});

export const send = mutation({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const email = await ctx.db.get(args.id);
    if (!email) throw new Error("E-mail não encontrado");
    if (email.userId !== identity.subject) throw new Error("Não autorizado");

    return email;
  },
});

export const markAsSent = mutation({
  args: {
    id: v.id("emails"),
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "sent",
      messageId: args.messageId,
      sentAt: Date.now(),
    });
  },
});

export const markAsFailed = mutation({
  args: {
    id: v.id("emails"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "failed",
      error: args.error,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("emails"),
    to: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
