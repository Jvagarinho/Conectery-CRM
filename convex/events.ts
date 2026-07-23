import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const listByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("events")
      .withIndex("by_userId_startDate", (q) =>
        q
          .eq("userId", identity.subject)
          .gte("startDate", args.startDate)
          .lte("startDate", args.endDate)
      )
      .collect();
  },
});

export const listByContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_contactId", (q) => q.eq("contactId", args.contactId))
      .order("desc")
      .collect();
  },
});

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
    dealId: v.optional(v.id("deals")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("meeting"),
      v.literal("call"),
      v.literal("task"),
      v.literal("other")
    ),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    location: v.optional(v.string()),
    createTask: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { createTask, ...eventData } = args;

    const eventId = await ctx.db.insert("events", {
      userId: identity.subject,
      ...eventData,
      createdAt: Date.now(),
    });

    if (createTask && (args.type === "meeting" || args.type === "call")) {
      const dueDate = new Date(args.startDate).toISOString().split("T")[0];

      await ctx.db.insert("tasks", {
        userId: identity.subject,
        contactId: args.contactId,
        eventId,
        title: `${args.type === "meeting" ? "Reunião" : "Chamada"}: ${args.title}`,
        type: args.type,
        status: "pending",
        dueDate,
        createdAt: Date.now(),
      });
    }

    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
    dealId: v.optional(v.id("deals")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("call"),
        v.literal("task"),
        v.literal("other")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const linkedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect();

    for (const task of linkedTasks) {
      await ctx.db.patch(task._id, { eventId: undefined });
    }

    return await ctx.db.delete(args.id);
  },
});
