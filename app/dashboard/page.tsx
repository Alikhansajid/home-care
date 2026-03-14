"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

interface UserProfile {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    // In a real app, you'd call a logout API
    // For now, we'll just clear and redirect
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary">NotiSaaS</span>
          <div className="h-6 w-px bg-border"></div>
          <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium">
            {profile?.name || user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Notifications", value: "1,284", change: "+12.5%" },
            { label: "Delivery Rate", value: "99.9%", change: "+0.1%" },
            { label: "Active Channels", value: "4", change: "None" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent Notifications</h3>
            <Button variant="outline" size="sm">View all</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Target</th>
                  <th className="px-6 py-4 font-medium">Channel</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { target: "user_123@example.com", channel: "Email", status: "Delivered", time: "2 mins ago" },
                  { target: "+1234567890", channel: "SMS", status: "Sent", time: "15 mins ago" },
                  { target: "device_abc", channel: "Push", status: "Delivered", time: "1 hour ago" },
                  { target: "webhook_xyz", channel: "Webhook", status: "Failed", time: "3 hours ago" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{row.target}</td>
                    <td className="px-6 py-4 text-sm">{row.channel}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        row.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        row.status === 'Failed' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
