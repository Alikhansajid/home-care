"use server";

import { db } from "@/db";
import { documents, homes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDocuments(homeId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const filters = [eq(documents.home_id, homes.id), eq(homes.user_id, userId)];
    if (homeId) {
      filters.push(eq(documents.home_id, homeId));
    }

    const result = await db
      .select({
        document: documents,
      })
      .from(documents)
      .innerJoin(homes, eq(documents.home_id, homes.id))
      .where(and(...filters))
      .orderBy(desc(documents.uploaded_at));

    return result.map(r => r.document);
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
}

export async function deleteDocument(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(documents).where(eq(documents.id, id));
  revalidatePath("/homeowner/documents");
}
