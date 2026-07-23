import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
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

    return await ctx.db.query("companies").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getContactsByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    billingStreet: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingDistrict: v.optional(v.string()),
    billingPostalCode: v.optional(v.string()),
    billingCountry: v.optional(v.string()),
    shippingStreet: v.optional(v.string()),
    shippingCity: v.optional(v.string()),
    shippingDistrict: v.optional(v.string()),
    shippingPostalCode: v.optional(v.string()),
    shippingCountry: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("companies", {
      userId: identity.subject,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    billingStreet: v.optional(v.string()),
    billingCity: v.optional(v.string()),
    billingDistrict: v.optional(v.string()),
    billingPostalCode: v.optional(v.string()),
    billingCountry: v.optional(v.string()),
    shippingStreet: v.optional(v.string()),
    shippingCity: v.optional(v.string()),
    shippingDistrict: v.optional(v.string()),
    shippingPostalCode: v.optional(v.string()),
    shippingCountry: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
