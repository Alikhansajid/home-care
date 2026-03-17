import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

const ensureProfile = async (userId: string, email: string, fullName: string, avatarUrl: string) => {
  const existing = await db.select().from(profiles).where(eq(profiles.id, userId));
  
  if (existing.length === 0) {
    console.log("Creating missing profile for user:", userId);
    await db.insert(profiles).values({
      id: userId,
      email: email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: "homeowner",
    });
    return (await db.select().from(profiles).where(eq(profiles.id, userId)))[0];
  }
  
  return existing[0];
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) redirect("/login");

  const email = user.primaryEmailAddress?.emailAddress || "";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const avatarUrl = user.imageUrl;

  const profile = await ensureProfile(userId, email, fullName, avatarUrl);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={profile?.role as "homeowner" | "technician" || "homeowner"} userName={profile?.full_name || user.primaryEmailAddress?.emailAddress} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
