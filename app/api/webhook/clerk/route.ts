import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const data = evt.data;
    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    const avatarUrl = data.image_url;

    await db.insert(profiles).values({
      id: id!,
      email: email,
      full_name: name,
      avatar_url: avatarUrl,
      role: "homeowner", // Default role
    });
  }

  if (eventType === "user.updated") {
    const data = evt.data;
    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    const avatarUrl = data.image_url;

    await db.update(profiles)
      .set({
        email: email,
        full_name: name,
        avatar_url: avatarUrl,
      })
      .where(eq(profiles.id, id!));
  }

  if (eventType === "user.deleted") {
    await db.delete(profiles).where(eq(profiles.id, id!));
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
