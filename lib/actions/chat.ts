"use server";

import { db } from "@/db";
import { messages, service_requests, technicians, profiles } from "@/db/schema";
import { eq, or, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentProfile() {
  const { userId } = await auth();
  if (!userId) return null;
  const res = await db.select().from(profiles).where(eq(profiles.id, userId));
  return res[0] || null;
}

export async function getConversations() {
  const { userId } = await auth();
  if (!userId) return [];

  const techProfile = (await db.select().from(technicians).where(eq(technicians.user_id, userId)))[0];
  const conditions = [eq(service_requests.homeowner_id, userId)];
  
  if (techProfile) {
    conditions.push(eq(service_requests.technician_id, techProfile.id));
  }

  const results = await db.select({
    req: service_requests,
    ho_profile: { full_name: profiles.full_name },
  })
  .from(service_requests)
  .leftJoin(profiles, eq(service_requests.homeowner_id, profiles.id))
  .where(or(...conditions));

  return results.map(r => ({
    id: r.req.id,
    title: r.req.title,
    homeowner_id: r.req.homeowner_id,
    technician_id: r.req.technician_id,
    profiles: r.ho_profile,
  }));
}

export async function getMessages(requestId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const results = await db.select({
    msg: messages,
    sender: {
      full_name: profiles.full_name,
      avatar_url: profiles.avatar_url,
    }
  })
  .from(messages)
  .leftJoin(profiles, eq(messages.sender_id, profiles.id))
  .where(eq(messages.request_id, requestId))
  .orderBy(asc(messages.created_at));

  return results.map(r => ({
    ...r.msg,
    sender: r.sender,
  }));
}

export async function sendMessage(requestId: string, content: string, receiverId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(messages).values({
    request_id: requestId,
    sender_id: userId,
    receiver_id: receiverId,
    content,
  });
}
