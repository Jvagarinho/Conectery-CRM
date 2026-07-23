import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("commercial")),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"]),

  companies: defineTable({
    userId: v.string(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_name", ["name"]),

  contacts: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    company: v.optional(v.string()),
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
    status: v.union(
      v.literal("lead"),
      v.literal("prospect"),
      v.literal("client"),
      v.literal("inactive")
    ),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_companyId", ["companyId"]),

  deals: defineTable({
    userId: v.string(),
    contactId: v.id("contacts"),
    title: v.string(),
    value: v.number(),
    stage: v.union(
      v.literal("qualification"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    expectedCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stage", ["stage"])
    .index("by_userId_stage", ["userId", "stage"]),

  tasks: defineTable({
    userId: v.string(),
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
    status: v.union(v.literal("pending"), v.literal("completed")),
    dueDate: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_dueDate", ["dueDate"])
    .index("by_eventId", ["eventId"]),

  events: defineTable({
    userId: v.string(),
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
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_startDate", ["startDate"])
    .index("by_userId_startDate", ["userId", "startDate"])
    .index("by_contactId", ["contactId"])
    .index("by_companyId", ["companyId"]),

  activityLog: defineTable({
    userId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  emails: defineTable({
    userId: v.string(),
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
    to: v.string(),
    from: v.string(),
    fromName: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    htmlBody: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("failed")
    ),
    template: v.optional(
      v.union(
        v.literal("meeting_request"),
        v.literal("task_assignment"),
        v.literal("campaign"),
        v.literal("follow_up"),
        v.literal("custom")
      )
    ),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_contactId", ["contactId"]),
});
