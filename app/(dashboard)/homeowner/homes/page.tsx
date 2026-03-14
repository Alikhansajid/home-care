"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Home, MapPin, Trash2, Edit, X, Square, Calendar } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { homeSchema, type HomeInput } from "@/lib/validations";
import { getHomes, createHome, updateHome, deleteHome } from "@/lib/actions/homes";
import type { Home as HomeType } from "@/types";
import { formatDate } from "@/lib/utils";

export default function HomesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingHome, setEditingHome] = useState<HomeType | null>(null);
  const queryClient = useQueryClient();

  const { data: homes = [], isLoading } = useQuery<HomeType[]>({
    queryKey: ["homes"],
    queryFn: async () => {
      const data = (await getHomes()) as HomeType[];
      return data || [];
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<HomeInput>({
    resolver: zodResolver(homeSchema) as any,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: HomeInput) => {
      if (editingHome) {
        await updateHome(editingHome.id, data);
      } else {
        await createHome(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
      toast.success(editingHome ? "Home updated!" : "Home added!");
      setShowForm(false);
      setEditingHome(null);
      reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteHome(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
      toast.success("Home removed.");
    },
  });

  const openEdit = (home: HomeType) => {
    setEditingHome(home);
    Object.entries(home).forEach(([k, v]) => setValue(k as any, v ?? ""));
    setShowForm(true);
  };

  return (
    <>
      <DashboardHeader title="My Homes" subtitle="Manage all your properties" />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{homes.length} {homes.length === 1 ? "Home" : "Homes"}</h2>
            <p className="text-sm text-muted-foreground">Add and manage your properties</p>
          </div>
          <Button onClick={() => { setEditingHome(null); reset(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Home
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="border-primary/20 shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold">{editingHome ? "Edit Home" : "Add New Home"}</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingHome(null); reset(); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit((d) => saveMutation.mutate(d as HomeInput))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Home Name *</Label>
                  <Input placeholder="e.g. Main House, Beach Cottage" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Street Address</Label>
                  <Input placeholder="123 Main Street" {...register("address")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input placeholder="USA" {...register("country")} />
                </div>
                <div className="space-y-1.5">
                  <Label>State / Province</Label>
                  <Input placeholder="New York" {...register("state")} />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input placeholder="New York City" {...register("city")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Size (sq ft)</Label>
                  <Input type="number" placeholder="2000" {...register("size_sqft")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Year Built</Label>
                  <Input type="number" placeholder="2005" {...register("year_built")} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea placeholder="Any special notes about this property..." {...register("notes")} />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : editingHome ? "Update Home" : "Add Home"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Homes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : homes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No homes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Add your first home to start tracking maintenance, expenses, and more.</p>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Your First Home</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homes.map((home) => (
              <Card key={home.id} className="card-hover shadow-sm border-0 group overflow-hidden">
                <div className="h-2 gradient-blue" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(home)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                        if (confirm("Delete this home? All associated data will be removed.")) deleteMutation.mutate(home.id);
                      }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{home.name}</h3>
                  {(home.city || home.country) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{[home.city, home.state, home.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                    {home.size_sqft && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Square className="w-3 h-3" />
                        {home.size_sqft.toLocaleString()} sq ft
                      </div>
                    )}
                    {home.year_built && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Built {home.year_built}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
