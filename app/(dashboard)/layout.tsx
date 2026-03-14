import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) redirect("/login");

  const profile = (await db.select().from(profiles).where(eq(profiles.id, userId)))[0];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={profile?.role as "homeowner" | "technician" || "homeowner"} userName={profile?.full_name || user.primaryEmailAddress?.emailAddress} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
