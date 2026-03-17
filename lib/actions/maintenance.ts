"use server";

import { db } from "@/db";
import { maintenance_tasks, homes } from "@/db/schema";
import { eq, inArray, asc, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { MaintenanceTaskInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getTasks(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const filters = [eq(homes.user_id, userId)];
    if (homeId) {
      filters.push(eq(maintenance_tasks.home_id, homeId));
    }

    const result = await db
      .select({
        task: maintenance_tasks,
        home: {
          id: homes.id,
          name: homes.name,
        },
      })
      .from(maintenance_tasks)
      .innerJoin(homes, eq(maintenance_tasks.home_id, homes.id))
      .where(sql.join(filters, sql` AND `))
      .orderBy(asc(maintenance_tasks.next_due_date));

    return result.map(({ task, home }) => ({
      ...task,
      homes: home, // Keep existing structure for frontend compatibility
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch maintenance tasks");
  }
}

export async function createTask(data: MaintenanceTaskInput, homeId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(maintenance_tasks).values({
    ...data,
    home_id: homeId,
  });

  revalidatePath("/homeowner/maintenance");
}

export async function updateTask(id: string, data: Partial<MaintenanceTaskInput>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(maintenance_tasks).set(data).where(eq(maintenance_tasks.id, id));
  revalidatePath("/homeowner/maintenance");
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

  revalidatePath("/homeowner/maintenance");
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(maintenance_tasks).where(eq(maintenance_tasks.id, id));
  revalidatePath("/homeowner/maintenance");
}
