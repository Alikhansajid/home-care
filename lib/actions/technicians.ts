"use server";

import { db } from "@/db";
import { technicians, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { TechnicianListingInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getTechnicianProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tech = await db.select().from(technicians).where(eq(technicians.user_id, userId));
  return tech[0] || null;
}

export async function updateTechnicianProfile(data: TechnicianListingInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db.select().from(technicians).where(eq(technicians.user_id, userId));
  
  if (existing.length > 0) {
    await db.update(technicians).set({
      ...data,
      is_available: true,
    }).where(eq(technicians.user_id, userId));
  } else {
    // Also update role of the profile to technician
    await db.update(profiles).set({ role: "technician" }).where(eq(profiles.id, userId));
    
    await db.insert(technicians).values({
      ...data,
      user_id: userId,
      is_available: true,
    });
  }
}

export async function toggleTechnicianAvailability(currentStatus: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(technicians).set({
    is_available: !currentStatus,
  }).where(eq(technicians.user_id, userId));
}
