"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Wrench, Calendar, FileText, DollarSign,
  Package, MessageSquare, Users, LayoutDashboard,
  Briefcase, Star, Settings, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SidebarProps {
  role: "homeowner" | "technician";
  userName?: string;
}

const homeownerNav = [
  { label: "Dashboard", href: "/homeowner/dashboard", icon: LayoutDashboard },
  { label: "My Homes", href: "/homeowner/homes", icon: Home },
  { label: "Appliances", href: "/homeowner/appliances", icon: Package },
  { label: "Maintenance", href: "/homeowner/maintenance", icon: Wrench },
  { label: "Calendar", href: "/homeowner/calendar", icon: Calendar },
  { label: "Documents", href: "/homeowner/documents", icon: FileText },
  { label: "Expenses", href: "/homeowner/expenses", icon: DollarSign },
];

const technicianNav = [
  { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
  { label: "Job Requests", href: "/technician/jobs", icon: Briefcase },
  { label: "My Listings", href: "/technician/listings", icon: Star },
];

const sharedNav = [
  { label: "Marketplace", href: "/marketplace", icon: Users },
  { label: "Messages", href: "/chat", icon: MessageSquare },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const navItems = role === "homeowner" ? homeownerNav : technicianNav;

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">HomeCare</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
            {userName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName || "User"}</p>
            <Badge variant={role === "homeowner" ? "default" : "success"} className="text-[10px] mt-0.5">
              {role === "homeowner" ? "Homeowner" : "Technician"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {role === "homeowner" ? "Home Management" : "Job Management"}
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link group",
                isActive ? "sidebar-link-active" : "sidebar-link-inactive"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
            </Link>
          );
        })}

        <div className="pt-3">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Platform
          </p>
          {sharedNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-link",
                  isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        <Link href="/settings" className="sidebar-link sidebar-link-inactive">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button onClick={handleLogout} className="sidebar-link sidebar-link-inactive w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
