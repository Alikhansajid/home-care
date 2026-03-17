"use server";

import { db } from "@/db";
import { expenses, homes } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ExpenseInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getExpenses(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const filters = [eq(expenses.user_id, userId)];
    if (homeId) {
      filters.push(eq(expenses.home_id, homeId));
    }

    return await db
      .select()
      .from(expenses)
      .where(and(...filters))
      .orderBy(desc(expenses.date));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw new Error("Failed to fetch expenses");
  }
}

export async function createExpense(data: ExpenseInput & { home_id: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(expenses).values({
    ...data,
    user_id: userId,
  });

  revalidatePath("/homeowner/expenses");
  revalidatePath("/homeowner/dashboard"); // Revalidate dashboard too since it shows expenses
}

export async function deleteExpense(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/homeowner/expenses");
  revalidatePath("/homeowner/dashboard");
}
