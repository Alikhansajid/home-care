"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Edit, Check, X } from "lucide-react";
import { technicianListingSchema, type TechnicianListingInput } from "@/lib/validations";
import { getTechnicianProfile, updateTechnicianProfile, toggleTechnicianAvailability } from "@/lib/actions/technicians";
import type { Technician } from "@/types";

const CATEGORIES = ["Plumber", "Electrician", "HVAC", "Roof Repair", "Cleaning", "Handyman", "Painter", "Landscaping", "Carpenter", "General Contractor"];

export default function TechnicianListingsPage() {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: techProfile, isLoading } = useQuery<Technician | null>({
    queryKey: ["tech-profile"],
    queryFn: async () => {
      const data = (await getTechnicianProfile()) as Technician | null;
      return data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<TechnicianListingInput>({
    resolver: zodResolver(technicianListingSchema) as any,
    values: techProfile ? {
      category: techProfile.category || "",
      description: techProfile.description || "",
      hourly_rate: techProfile.hourly_rate || 0,
      country: techProfile.country || "",
      state: techProfile.state || "",
      city: techProfile.city || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TechnicianListingInput) => {
      await updateTechnicianProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-profile"] });
      toast.success("Profile updated! You're now visible in the marketplace.");
      setEditing(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAvailability = async () => {
      await toggleTechnicianAvailability(!!techProfile?.is_available);
      queryClient.invalidateQueries({ queryKey: ["tech-profile"] });
      toast.success(techProfile?.is_available ? "Set to unavailable" : "Set to available");
  };

  return (
    <>
      <DashboardHeader title="My Listing" subtitle="Manage your technician profile in the marketplace" />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Profile Card */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Service Listing</CardTitle>
                {techProfile && (
                  <Badge variant={techProfile.is_available ? "success" : "secondary"}>
                    {techProfile.is_available ? "● Available" : "○ Unavailable"}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {techProfile && (
                  <Button variant="outline" size="sm" onClick={toggleAvailability}>
                    {techProfile.is_available ? "Set Unavailable" : "Set Available"}
                  </Button>
                )}
                <Button size="sm" variant={editing ? "ghost" : "default"} onClick={() => setEditing(!editing)}>
                  {editing ? <><X className="w-3.5 h-3.5 mr-1" />Cancel</> : <><Edit className="w-3.5 h-3.5 mr-1" />Edit Profile</>}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!editing && techProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: "Service Category", value: techProfile.category || "—" },
                  { label: "Hourly Rate", value: techProfile.hourly_rate ? `$${techProfile.hourly_rate}/hr` : "—" },
                  { label: "Country", value: techProfile.country || "—" },
                  { label: "State", value: techProfile.state || "—" },
                  { label: "City", value: techProfile.city || "—" },
                  { label: "Rating", value: techProfile.rating ? `${techProfile.rating.toFixed(1)} ⭐ (${techProfile.total_reviews} reviews)` : "No reviews yet" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                    <p className="text-sm font-medium">{f.value}</p>
                  </div>
                ))}
                {techProfile.description && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{techProfile.description}</p>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
            ) : (
              <form onSubmit={handleSubmit((d) => updateMutation.mutate(d as TechnicianListingInput))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Service Category *</Label>
                  <select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Hourly Rate ($) *</Label>
                  <Input type="number" placeholder="75" {...register("hourly_rate")} />
                  {errors.hourly_rate && <p className="text-xs text-red-500">{errors.hourly_rate.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Country *</Label>
                  <Input placeholder="USA" {...register("country")} />
                  {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input placeholder="California" {...register("state")} />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input placeholder="Los Angeles" {...register("city")} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe your services, experience, and specializations..."
                    {...register("description")}
                    rows={4}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : <><Check className="w-4 h-4 mr-1.5" />Save Profile</>}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {techProfile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Rating", value: techProfile.rating?.toFixed(1) || "New", icon: "⭐" },
              { label: "Reviews", value: techProfile.total_reviews || 0, icon: "💬" },
              { label: "Status", value: techProfile.is_verified ? "Verified" : "Pending", icon: "✅" },
              { label: "Availability", value: techProfile.is_available ? "Open" : "Closed", icon: "🟢" },
            ].map(s => (
              <Card key={s.label} className="shadow-sm border-0">
                <CardContent className="p-5 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
