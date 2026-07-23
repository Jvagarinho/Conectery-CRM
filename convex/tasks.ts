import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const tasksWithEvents = await Promise.all(
      tasks.map(async (task) => {
        if (task.eventId) {
          const event = await ctx.db.get(task.eventId);
          return { ...task, event };
        }
        return { ...task, event: null };
      })
    );

    return tasksWithEvents;
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const pendingTasks = allTasks.filter((task) => task.status === "pending");

    const pendingTasksWithEvents = await Promise.all(
      pendingTasks.map(async (task) => {
        if (task.eventId) {
          const event = await ctx.db.get(task.eventId);
          return { ...task, event };
        }
        return { ...task, event: null };
      })
    );

    return pendingTasksWithEvents;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user?.role !== "admin") return [];

    const tasks = await ctx.db.query("tasks").order("desc").collect();

    const tasksWithEvents = await Promise.all(
      tasks.map(async (task) => {
        if (task.eventId) {
          const event = await ctx.db.get(task.eventId);
          return { ...task, event };
        }
        return { ...task, event: null };
      })
    );

    return tasksWithEvents;
  },
});

export const create = mutation({
  args: {
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
    eventId: v.optional(v.id("events")),
    title: v.string(),
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("task")
    ),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("tasks", {
      userId: identity.subject,
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("call"),
        v.literal("email"),
        v.literal("meeting"),
        v.literal("task")
      )
    ),
    dueDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
