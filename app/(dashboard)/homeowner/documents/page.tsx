"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Upload, FileText, Trash2, Download, Plus, FolderOpen } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDocuments, deleteDocument } from "@/lib/actions/documents";
import { getHomes } from "@/lib/actions/homes";
import type { Document, Home } from "@/types";
import { formatDate } from "@/lib/utils";

const DOC_CATEGORIES = ["Warranty", "Invoice", "Manual", "Receipt", "Insurance", "Contract", "Other"];

const CATEGORY_ICONS: Record<string, string> = {
  Warranty: "🛡️", Invoice: "📄", Manual: "📚", Receipt: "🧾",
  Insurance: "🏦", Contract: "📋", Other: "📁",
};

export default function DocumentsPage() {
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: homes = [] } = useQuery<Home[]>({
    queryKey: ["homes"],
    queryFn: async () => {
      const data = (await getHomes()) as Home[];
      return data || [];
    },
  });

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["documents", selectedHome],
    queryFn: async () => {
      const data = (await getDocuments(selectedHome || undefined)) as Document[];
      return data || [];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const homeId = selectedHome || homes[0]?.id;
    if (!homeId) { toast.error("Please add a home first."); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("File must be under 50MB."); return; }

    setUploading(true);
    try {
      toast.error("Document storage is currently disabled pending Cloudflare R2 migration.");
      await new Promise(r => setTimeout(r, 600));
    } catch (e: any) {
      toast.error(e.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string | null }) => {
      await deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted.");
    },
  });

  return (
    <>
      <DashboardHeader title="Documents" subtitle="Store warranties, manuals, invoices and more" />
      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Upload Area */}
        <Card className="shadow-sm border-0 border-dashed border-2 border-border hover:border-primary/50 transition-colors bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Upload Document</h3>
            <p className="text-sm text-muted-foreground mb-5">PDF, images, Word files up to 50MB</p>
            <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
              <select
                value={selectedHome}
                onChange={(e) => setSelectedHome(e.target.value)}
                className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Home</option>
                {homes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept="*/*" onChange={handleUpload} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : <><Plus className="w-4 h-4 mr-2" />Choose File</>}
            </Button>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedHome}
            onChange={(e) => setSelectedHome(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-border bg-white focus:outline-none"
          >
            <option value="">All Homes</option>
            {homes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="font-medium">No documents uploaded</p>
            <p className="text-sm text-muted-foreground">Upload your first document above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-sm border-0 group card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{CATEGORY_ICONS[doc.category || "Other"] || "📁"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{doc.category || "Other"}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(doc.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Download className="w-3 h-3 mr-1" /> View / Download
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                      onClick={() => { if (confirm("Delete this document?")) deleteMutation.mutate({ id: doc.id, fileUrl: doc.file_url }); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
