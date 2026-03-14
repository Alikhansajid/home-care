"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  avatarUrl?: string;
}

export function DashboardHeader({ title, subtitle, userName, avatarUrl }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
          <input
            placeholder="Search..."
            className="h-9 pl-9 pr-4 text-sm border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-56 transition-all"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src={avatarUrl || ""} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
