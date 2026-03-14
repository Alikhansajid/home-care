import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), // Clerk user ID
  full_name: text("full_name"),
  email: text("email").notNull(),
  avatar_url: text("avatar_url"),
  role: text("role").default("homeowner"), // 'homeowner' | 'technician'
  phone: text("phone"),
  stripe_customer_id: text("stripe_customer_id"),
  plan: text("plan").default("free"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const homes = sqliteTable("homes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  country: text("country"),
  state: text("state"),
  city: text("city"),
  size_sqft: integer("size_sqft"),
  year_built: integer("year_built"),
  notes: text("notes"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const appliances = sqliteTable("appliances", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  home_id: text("home_id").references(() => homes.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  category: text("category"),
  brand: text("brand"),
  model: text("model"),
  installation_date: text("installation_date"), // Stored as ISO string YYYY-MM-DD
  warranty_expiry: text("warranty_expiry"),
  notes: text("notes"),
});

export const maintenance_tasks = sqliteTable("maintenance_tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  home_id: text("home_id").references(() => homes.id, { onDelete: "cascade" }).notNull(),
  appliance_id: text("appliance_id").references(() => appliances.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  frequency_days: integer("frequency_days"),
  next_due_date: text("next_due_date"),
  last_completed: text("last_completed"),
  status: text("status").default("pending"),
  priority: text("priority").default("normal"),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  home_id: text("home_id").references(() => homes.id, { onDelete: "cascade" }).notNull(),
  user_id: text("user_id").references(() => profiles.id),
  name: text("name").notNull(),
  file_url: text("file_url"),
  category: text("category"),
  uploaded_at: text("uploaded_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  home_id: text("home_id").references(() => homes.id, { onDelete: "cascade" }).notNull(),
  user_id: text("user_id").references(() => profiles.id),
  category: text("category"),
  amount: real("amount").notNull(),
  description: text("description"),
  date: text("date"),
  notes: text("notes"),
});

export const technicians = sqliteTable("technicians", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  category: text("category"),
  description: text("description"),
  hourly_rate: real("hourly_rate"),
  country: text("country"),
  state: text("state"),
  city: text("city"),
  is_verified: integer("is_verified", { mode: "boolean" }).default(false),
  is_available: integer("is_available", { mode: "boolean" }).default(true),
  rating: real("rating").default(0),
  total_reviews: integer("total_reviews").default(0),
  profile_image: text("profile_image"),
});

export const service_requests = sqliteTable("service_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  homeowner_id: text("homeowner_id").references(() => profiles.id),
  technician_id: text("technician_id").references(() => technicians.id),
  home_id: text("home_id").references(() => homes.id),
  title: text("title"),
  description: text("description"),
  status: text("status").default("pending"), // pending, accepted, in_progress, completed, rejected
  scheduled_date: text("scheduled_date"),
  completed_date: text("completed_date"),
  amount: real("amount"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").references(() => service_requests.id),
  sender_id: text("sender_id").references(() => profiles.id),
  receiver_id: text("receiver_id").references(() => profiles.id),
  content: text("content"),
  read: integer("read", { mode: "boolean" }).default(false),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  technician_id: text("technician_id").references(() => technicians.id),
  homeowner_id: text("homeowner_id").references(() => profiles.id),
  request_id: text("request_id").references(() => service_requests.id),
  rating: integer("rating"), // Check condition rating BETWEEN 1 AND 5 in app logic
  comment: text("comment"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});
