"use server";

import { db } from "@/db";
import { maintenance_tasks, homes } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { MaintenanceTaskInput } from "@/lib/validations";

export async function getTasks(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const userHomes = await db.select({ id: homes.id, name: homes.name }).from(homes).where(eq(homes.user_id, userId));
  const homeIds = userHomes.map(h => h.id);

  if (homeIds.length === 0) return [];

  let query = db.select().from(maintenance_tasks).where(inArray(maintenance_tasks.home_id, homeIds)).orderBy(asc(maintenance_tasks.next_due_date));

  if (homeId) {
    query = db.select().from(maintenance_tasks).where(eq(maintenance_tasks.home_id, homeId)).orderBy(asc(maintenance_tasks.next_due_date));
  }

  const result = await query;
  return result.map(task => ({
    ...task,
    homes: userHomes.find(h => h.id === task.home_id),
  }));
}

export async function createTask(data: MaintenanceTaskInput, homeId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(maintenance_tasks).values({
    ...data,
    home_id: homeId,
  });
}

export async function updateTask(id: string, data: Partial<MaintenanceTaskInput>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(maintenance_tasks).set(data).where(eq(maintenance_tasks.id, id));
}

export async function completeTask(id: string, frequencyDays: number | null) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const today = new Date();
  const nextDate = frequencyDays
    ? new Date(today.getTime() + frequencyDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : null;

  await db.update(maintenance_tasks).set({
    status: "completed",
    last_completed: today.toISOString().split("T")[0],
    next_due_date: nextDate,
  }).where(eq(maintenance_tasks.id, id));
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(maintenance_tasks).where(eq(maintenance_tasks.id, id));
}
