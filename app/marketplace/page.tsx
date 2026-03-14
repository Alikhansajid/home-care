"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Filter, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchTechnicians } from "@/lib/actions/marketplace";
import type { Technician } from "@/types";
import Link from "next/link";

const CATEGORIES = ["All", "Plumber", "Electrician", "HVAC", "Roof Repair", "Cleaning", "Handyman", "Painter", "Landscaping"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const { data: technicians = [], isLoading } = useQuery<(Technician & { profiles: any })[]>({
    queryKey: ["technicians", category, country, city],
    queryFn: async () => {
      const data = await searchTechnicians(category, country, city);
      return data as (Technician & { profiles: any })[];
    },
  });

  const filtered = technicians.filter(t => {
    if (!search) return true;
    const name = t.profiles?.full_name?.toLowerCase() || "";
    const desc = t.description?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="gradient-blue text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-3">Find Expert Technicians</h1>
          <p className="text-blue-100 text-lg mb-8">Verified professionals ready to help with any home repair.</p>
          <div className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search by name or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <Button variant="secondary" className="h-12 px-5">Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-muted-foreground border border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
            />
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-5">
          {isLoading ? "Finding technicians..." : `${filtered.length} technician${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Technician Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-lg font-semibold">No technicians found</p>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tech) => (
              <Card key={tech.id} className="card-hover shadow-sm border-0 overflow-hidden">
                <div className="h-1.5 gradient-blue" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-border">
                      <AvatarImage src={tech.profile_image || tech.profiles?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {tech.profiles?.full_name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{tech.profiles?.full_name || "Technician"}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-foreground font-medium">{tech.rating?.toFixed(1) || "New"}</span>
                        {tech.total_reviews > 0 && <span className="text-xs text-muted-foreground">({tech.total_reviews})</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {tech.is_verified && (
                        <Badge variant="success" className="text-[10px]">✓ Verified</Badge>
                      )}
                      <Badge variant={tech.is_available ? "default" : "secondary"} className="text-[10px]">
                        {tech.is_available ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Badge variant="outline" className="text-xs">{tech.category || "General"}</Badge>
                    {(tech.city || tech.country) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {[tech.city, tech.state, tech.country].filter(Boolean).join(", ")}
                      </div>
                    )}
                    {tech.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tech.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      {tech.hourly_rate && (
                        <span className="font-bold text-primary">${tech.hourly_rate}<span className="text-xs text-muted-foreground font-normal">/hr</span></span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <Link href={`/chat?techId=${tech.user_id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <MessageSquare className="w-3 h-3 mr-1" /> Chat
                        </Button>
                      </Link>
                      <Button size="sm" className="h-7 text-xs">Book</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
