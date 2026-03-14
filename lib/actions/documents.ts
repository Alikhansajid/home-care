"use server";

import { db } from "@/db";
import { documents, homes } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getDocuments(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const userHomes = await db.select({ id: homes.id }).from(homes).where(eq(homes.user_id, userId));
  const homeIds = userHomes.map(h => h.id);

  if (homeIds.length === 0) return [];

  let query = db.select().from(documents).where(inArray(documents.home_id, homeIds)).orderBy(desc(documents.uploaded_at));

  if (homeId) {
    query = db.select().from(documents).where(eq(documents.home_id, homeId)).orderBy(desc(documents.uploaded_at));
  }

  return await query;
}

export async function deleteDocument(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(documents).where(eq(documents.id, id));
}
