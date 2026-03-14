"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, DollarSign, TrendingUp, X, Trash2, PieChart } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { getExpenses, createExpense, deleteExpense } from "@/lib/actions/expenses";
import { getHomes } from "@/lib/actions/homes";
import type { Expense, Home } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIES = ["Repair", "Service", "Upgrade", "Cleaning", "Utilities", "Insurance", "Appliance", "Landscaping", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Repair: "bg-red-500", Service: "bg-blue-500", Upgrade: "bg-purple-500",
  Cleaning: "bg-green-500", Utilities: "bg-yellow-500", Insurance: "bg-orange-500",
  Appliance: "bg-pink-500", Landscaping: "bg-emerald-500", Other: "bg-gray-500",
};

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedHome, setSelectedHome] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: homes = [] } = useQuery<Home[]>({
    queryKey: ["homes"],
    queryFn: async () => {
      const data = (await getHomes()) as Home[];
      return data || [];
    },
  });

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses", selectedHome],
    queryFn: async () => {
      const data = (await getExpenses(selectedHome || undefined)) as Expense[];
      return data || [];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema) as any,
  });

  const addMutation = useMutation({
    mutationFn: async (data: ExpenseInput) => {
      const homeId = selectedHome || homes[0]?.id;
      if (!homeId) throw new Error("Please add a home first.");
      await createExpense({ ...data, home_id: homeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added!");
      setShowForm(false);
      reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense removed.");
    },
  });

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <>
      <DashboardHeader title="Expenses" subtitle="Track your home maintenance costs" />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold mt-1">{expenses.length}</p>
                </div>
                <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. per Entry</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(expenses.length ? totalAmount / expenses.length : 0)}</p>
                </div>
                <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={selectedHome}
                  onChange={(e) => setSelectedHome(e.target.value)}
                  className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Homes</option>
                  {homes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>

            {showForm && (
              <Card className="border-primary/20 shadow-sm animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">New Expense</h3>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => { setShowForm(false); reset(); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleSubmit((d) => addMutation.mutate(d as ExpenseInput))} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Category *</Label>
                      <select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Amount ($) *</Label>
                      <Input type="number" step="0.01" placeholder="250.00" {...register("amount")} />
                      {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input type="date" {...register("date")} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Description</Label>
                      <Input placeholder="Brief description" {...register("description")} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional details..." {...register("notes")} rows={2} />
                    </div>
                    <div className="col-span-2 flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={addMutation.isPending}>
                        {addMutation.isPending ? "Saving..." : "Add Expense"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium">No expenses recorded</p>
                <p className="text-sm text-muted-foreground">Track your home maintenance costs.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map(exp => (
                  <Card key={exp.id} className="shadow-sm border-0 group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[exp.category || "Other"] || "bg-gray-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{exp.description || exp.category}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Badge variant="secondary" className="text-[10px]">{exp.category}</Badge>
                          {exp.date && <span>{formatDate(exp.date)}</span>}
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">{formatCurrency(exp.amount)}</p>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { if (confirm("Remove this expense?")) deleteMutation.mutate(exp.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div>
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                ) : topCategories.map(([cat, amount]) => {
                  const pct = totalAmount ? Math.round((amount / totalAmount) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-400"}`} />
                          <span className="text-foreground">{cat}</span>
                        </div>
                        <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${CATEGORY_COLORS[cat] || "bg-gray-400"} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
