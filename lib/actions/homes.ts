"use server";

import { db } from "@/db";
import { homes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { HomeInput } from "@/lib/validations";

export async function getHomes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db.select().from(homes).where(eq(homes.user_id, userId));
}

export async function createHome(data: HomeInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(homes).values({
    ...data,
    user_id: userId,
  });
}

export async function updateHome(id: string, data: HomeInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(homes).set(data).where(eq(homes.id, id));
}

export async function deleteHome(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(homes).where(eq(homes.id, id));
}
