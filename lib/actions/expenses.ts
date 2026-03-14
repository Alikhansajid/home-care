"use server";

import { db } from "@/db";
import { expenses, homes } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ExpenseInput } from "@/lib/validations";

export async function getExpenses(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const userHomes = await db.select({ id: homes.id }).from(homes).where(eq(homes.user_id, userId));
  const homeIds = userHomes.map(h => h.id);

  if (homeIds.length === 0) return [];

  let query = db.select().from(expenses).where(inArray(expenses.home_id, homeIds)).orderBy(desc(expenses.date));

  if (homeId) {
    query = db.select().from(expenses).where(eq(expenses.home_id, homeId)).orderBy(desc(expenses.date));
  }

  return await query;
}

export async function createExpense(data: ExpenseInput & { home_id: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(expenses).values({
    ...data,
    user_id: userId,
  });
}

export async function deleteExpense(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(expenses).where(eq(expenses.id, id));
}
