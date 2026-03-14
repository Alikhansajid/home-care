"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Wrench, CheckCircle, Clock, AlertTriangle, X, Edit, Trash2, RotateCcw } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { maintenanceTaskSchema, type MaintenanceTaskInput } from "@/lib/validations";
import { getTasks, createTask, updateTask, completeTask, deleteTask } from "@/lib/actions/maintenance";
import { getHomes } from "@/lib/actions/homes";
import type { MaintenanceTask, Home } from "@/types";
import { formatDate, getDaysUntil } from "@/lib/utils";

const TASK_TEMPLATES = [
  { title: "HVAC Service", category: "HVAC", frequency_days: 180, priority: "high" as const },
  { title: "Roof Inspection", category: "Roofing", frequency_days: 365, priority: "normal" as const },
  { title: "Filter Replacement", category: "HVAC", frequency_days: 90, priority: "normal" as const },
  { title: "Water Heater Flush", category: "Plumbing", frequency_days: 365, priority: "normal" as const },
  { title: "Gutter Cleaning", category: "Exterior", frequency_days: 180, priority: "normal" as const },
  { title: "Smoke Detector Test", category: "Safety", frequency_days: 90, priority: "high" as const },
];

export default function MaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: homes = [] } = useQuery<Home[]>({
    queryKey: ["homes"],
    queryFn: async () => {
      const data = (await getHomes()) as Home[];
      return data || [];
    },
  });

  const { data: tasks = [], isLoading } = useQuery<(MaintenanceTask & { homes?: Home })[]>({
    queryKey: ["maintenance-tasks", selectedHome],
    queryFn: async () => {
      const data = (await getTasks(selectedHome || undefined)) as (MaintenanceTask & { homes?: Home })[];
      return data || [];
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MaintenanceTaskInput>({
    resolver: zodResolver(maintenanceTaskSchema) as any,
    defaultValues: { priority: "normal" as any },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ data, homeId }: { data: MaintenanceTaskInput; homeId: string }) => {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data, homeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success(editingTask ? "Task updated!" : "Task added!");
      setShowForm(false);
      setEditingTask(null);
      reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, frequencyDays }: { id: string; frequencyDays: number | null }) => {
      await completeTask(id, frequencyDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Task marked as complete! 🎉");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Task removed.");
    },
  });

  const applyTemplate = (template: typeof TASK_TEMPLATES[0]) => {
    setValue("title", template.title);
    setValue("category", template.category);
    setValue("frequency_days", template.frequency_days);
    setValue("priority", template.priority);
    const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setValue("next_due_date", nextDate);
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return t.status === "pending";
    if (filterStatus === "completed") return t.status === "completed";
    if (filterStatus === "overdue") {
      return t.next_due_date && getDaysUntil(t.next_due_date) < 0 && t.status !== "completed";
    }
    return true;
  });

  const getTaskBadge = (task: MaintenanceTask) => {
    if (task.status === "completed") return <Badge variant="success">Completed</Badge>;
    if (!task.next_due_date) return <Badge variant="secondary">No due date</Badge>;
    const days = getDaysUntil(task.next_due_date);
    if (days < 0) return <Badge variant="destructive">{Math.abs(days)}d overdue</Badge>;
    if (days === 0) return <Badge variant="warning">Due today</Badge>;
    if (days <= 7) return <Badge variant="warning">In {days}d</Badge>;
    return <Badge variant="secondary">In {days}d</Badge>;
  };

  return (
    <>
      <DashboardHeader title="Maintenance" subtitle="Track and schedule home maintenance tasks" />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedHome}
              onChange={(e) => setSelectedHome(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Homes</option>
              {homes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {["all", "pending", "overdue", "completed"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${filterStatus === s ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => { setEditingTask(null); reset({ priority: "normal" }); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>

        {/* Task Form */}
        {showForm && (
          <Card className="border-primary/20 shadow-sm animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{editingTask ? "Edit Task" : "Add Maintenance Task"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingTask(null); reset(); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Templates */}
              {!editingTask && (
                <div className="mb-5">
                  <p className="text-sm text-muted-foreground mb-2">Quick templates:</p>
                  <div className="flex gap-2 flex-wrap">
                    {TASK_TEMPLATES.map(t => (
                      <button
                        key={t.title}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="px-3 py-1 text-xs rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit((d) => {
                const homeId = selectedHome || homes[0]?.id;
                if (!homeId) { toast.error("Please add a home first."); return; }
                saveMutation.mutate({ data: d as MaintenanceTaskInput, homeId });
              })} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingTask && homes.length > 1 && (
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Select Home *</Label>
                    <select
                      value={selectedHome}
                      onChange={e => setSelectedHome(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {homes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Task Title *</Label>
                  <Input placeholder="e.g. HVAC Annual Service" {...register("title")} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input placeholder="HVAC, Plumbing, Roofing..." {...register("category")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <select {...register("priority")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Next Due Date</Label>
                  <Input type="date" {...register("next_due_date")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Recurrence (days)</Label>
                  <Input type="number" placeholder="180 = every 6 months" {...register("frequency_days")} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="Task details..." {...register("description")} />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Saving..." : editingTask ? "Update" : "Add Task"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="font-medium text-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground">Add your first maintenance task above.</p>
            </div>
          ) : filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <Card key={task.id} className={`shadow-sm border-0 group transition-all ${isCompleted ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => !isCompleted && completeMutation.mutate({ id: task.id, frequencyDays: task.frequency_days })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? "bg-green-500 border-green-500" : "border-border hover:border-green-500"}`}
                  >
                    {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      {task.priority === "urgent" && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                      {task.priority === "high" && !isCompleted && <Badge variant="warning" className="text-[10px]">High</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {task.category && <span>{task.category}</span>}
                      {(task as any).homes?.name && <span>· {(task as any).homes?.name}</span>}
                      {task.frequency_days && <span>· Every {task.frequency_days}d</span>}
                      {task.last_completed && <span>· Last: {formatDate(task.last_completed)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTaskBadge(task)}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setEditingTask(task);
                        Object.entries(task).forEach(([k, v]) => setValue(k as keyof MaintenanceTaskInput, v as any));
                        setShowForm(true);
                      }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => {
                        if (confirm("Delete this task?")) deleteMutation.mutate(task.id);
                      }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
