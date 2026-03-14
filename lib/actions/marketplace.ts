"use server";

import { db } from "@/db";
import { technicians, profiles } from "@/db/schema";
import { eq, like, desc, and } from "drizzle-orm";

export async function searchTechnicians(category: string, country: string, city: string) {
  const conditions = [eq(technicians.is_available, true)];
  
  if (category !== "All") conditions.push(eq(technicians.category, category));
  if (country) conditions.push(like(technicians.country, `%${country}%`));
  if (city) conditions.push(like(technicians.city, `%${city}%`));

  const results = await db.select({
    tech: technicians,
    profile: {
      full_name: profiles.full_name,
      email: profiles.email,
      avatar_url: profiles.avatar_url,
    }
  })
  .from(technicians)
  .leftJoin(profiles, eq(technicians.user_id, profiles.id))
  .where(and(...conditions))
  .orderBy(desc(technicians.rating))
  .limit(50);

  return results.map(row => ({
    ...row.tech,
    profiles: row.profile
  }));
}
