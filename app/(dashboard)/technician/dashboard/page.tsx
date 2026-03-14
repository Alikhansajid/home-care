import { db } from "@/db";
import { profiles, technicians, service_requests, homes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Star, DollarSign, MessageSquare, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TechnicianDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const profile = (await db.select().from(profiles).where(eq(profiles.id, userId)))[0];
  const techProfile = (await db.select().from(technicians).where(eq(technicians.user_id, userId)))[0];

  let requests: any[] = [];
  if (techProfile) {
    const res = await db.select({
      req: service_requests,
      home: { name: homes.name, city: homes.city },
      profile: { full_name: profiles.full_name, email: profiles.email }
    })
    .from(service_requests)
    .leftJoin(homes, eq(service_requests.home_id, homes.id))
    .leftJoin(profiles, eq(service_requests.homeowner_id, profiles.id))
    .where(eq(service_requests.technician_id, techProfile.id))
    .orderBy(desc(service_requests.created_at))
    .limit(10);

    requests = res.map(row => ({
      ...row.req,
      profiles: row.profile,
      homes: row.home
    }));
  }

  const pending = requests?.filter(r => r.status === "pending") || [];
  const active = requests?.filter(r => r.status === "in_progress" || r.status === "accepted") || [];
  const completed = requests?.filter(r => r.status === "completed") || [];
  const totalRevenue = completed.reduce((sum, r) => sum + (r.amount || 0), 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "warning", accepted: "default", in_progress: "default",
      completed: "success", rejected: "destructive",
    };
    return <Badge variant={(map[status] as any) || "secondary"} className="capitalize">{status.replace("_", " ")}</Badge>;
  };

  return (
    <>
      <DashboardHeader
        title="Technician Dashboard"
        subtitle={`Welcome, ${profile?.full_name?.split(" ")[0]} 👋`}
        userName={profile?.full_name || ""}
      />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Profile Prompt */}
        {!techProfile?.category && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">Complete your technician profile</p>
              <p className="text-xs text-blue-600">Add your service category, location, and hourly rate to appear in the marketplace.</p>
            </div>
            <Link href="/technician/listings">
              <Button size="sm" className="shrink-0">Set Up Profile</Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Pending", value: pending.length, icon: Clock, color: "gradient-orange" },
            { label: "Active Jobs", value: active.length, icon: Briefcase, color: "gradient-blue" },
            { label: "Completed", value: completed.length, icon: CheckCircle, color: "gradient-green" },
            { label: "Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "gradient-purple" },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <CardTitle className="text-base">New Requests ({pending.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pending.map((req) => (
                  <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        From: {(req.profiles as any)?.full_name} · {(req.homes as any)?.name}
                      </p>
                      {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{formatDate(req.created_at)}</p>
                      <Link href={`/technician/jobs?id=${req.id}`}>
                        <Button size="sm" className="h-7 text-xs">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Recent Jobs */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <Link href="/technician/jobs">
                <Button variant="ghost" size="sm" className="text-primary">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!requests || requests.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium">No job requests yet</p>
                <p className="text-sm text-muted-foreground">Make sure your profile is complete to start receiving requests.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {requests.slice(0, 8).map((req) => (
                  <div key={req.id} className="px-6 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{(req.profiles as any)?.full_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.amount && <span className="text-sm font-medium">{formatCurrency(req.amount)}</span>}
                      {statusBadge(req.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
