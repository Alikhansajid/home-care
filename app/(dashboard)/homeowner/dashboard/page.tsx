import { db } from "@/db";
import { profiles, homes as homesTable, maintenance_tasks, expenses as expensesTable } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, Wrench, AlertTriangle, CheckCircle2, 
  DollarSign, FileText, TrendingUp, Plus, ArrowRight, Clock
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils";

export default async function HomeownerDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [profileRes, homesRes] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, userId)),
    db.select().from(homesTable).where(eq(homesTable.user_id, userId)),
  ]);

  const profile = profileRes[0];
  const homes = homesRes;
  const homeIds = homes.map(h => h.id);

  let tasks: any[] = [];
  let expenses: any[] = [];

  if (homeIds.length > 0) {
    const [rawTasks, rawExpenses] = await Promise.all([
      db.select()
        .from(maintenance_tasks)
        .where(inArray(maintenance_tasks.home_id, homeIds))
        .orderBy(asc(maintenance_tasks.next_due_date))
        .limit(5),
      db.select()
        .from(expensesTable)
        .where(inArray(expensesTable.home_id, homeIds)),
    ]);
    
    tasks = rawTasks.map(t => ({
      ...t,
      homes: homes.find(h => h.id === t.home_id)
    }));

    expenses = rawExpenses;
  }

  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const overdueTasks = tasks?.filter(t => t.status === "overdue" || (t.next_due_date && getDaysUntil(t.next_due_date) < 0)) || [];
  const upcomingTasks = tasks?.filter(t => t.next_due_date && getDaysUntil(t.next_due_date) >= 0).slice(0, 5) || [];

  const stats = [
    { label: "My Homes", value: homes?.length || 0, icon: Home, color: "gradient-blue", change: "Active" },
    { label: "Overdue Tasks", value: overdueTasks.length, icon: AlertTriangle, color: "gradient-orange", change: "Need attention" },
    { label: "Upcoming Tasks", value: upcomingTasks.length, icon: Wrench, color: "gradient-purple", change: "This month" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: DollarSign, color: "gradient-green", change: "This year" },
  ];

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${profile?.full_name?.split(" ")[0] || "there"} 👋`}
        userName={profile?.full_name || ""}
      />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="card-hover border-0 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Maintenance */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Maintenance</CardTitle>
                  <Link href="/homeowner/maintenance">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View all <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
                    <p className="text-xs text-muted-foreground mb-4">No maintenance tasks due soon.</p>
                    <Link href="/homeowner/maintenance">
                      <Button size="sm" variant="outline"><Plus className="w-3 h-3 mr-1" />Add Task</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {upcomingTasks.map((task) => {
                      const days = task.next_due_date ? getDaysUntil(task.next_due_date) : null;
                      const isUrgent = days !== null && days <= 3;
                      return (
                        <div key={task.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isUrgent ? "bg-red-500" : days !== null && days <= 7 ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{(task.homes as any)?.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {days !== null && (
                              <Badge variant={isUrgent ? "destructive" : days <= 7 ? "warning" : "secondary"} className="text-xs">
                                {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d overdue` : `In ${days}d`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Homes */}
          <div className="space-y-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { label: "Add Home", icon: Home, href: "/homeowner/homes", color: "text-blue-600 bg-blue-50" },
                  { label: "Add Task", icon: Wrench, href: "/homeowner/maintenance", color: "text-purple-600 bg-purple-50" },
                  { label: "Add Expense", icon: DollarSign, href: "/homeowner/expenses", color: "text-green-600 bg-green-50" },
                  { label: "Upload Doc", icon: FileText, href: "/homeowner/documents", color: "text-orange-600 bg-orange-50" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* My Homes */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">My Homes</CardTitle>
                  <Link href="/homeowner/homes">
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {homes?.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No homes added yet.</p>
                    <Link href="/homeowner/homes"><Button size="sm" className="mt-2">Add your home</Button></Link>
                  </div>
                )}
                {homes?.slice(0, 3).map((home) => (
                  <div key={home.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50">
                    <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{home.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{home.city}, {home.country}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
