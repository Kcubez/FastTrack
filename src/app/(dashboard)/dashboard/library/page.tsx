"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Search, Filter, Trash2, CheckCircle2, Clock, RefreshCw,
  BookOpen, ChevronLeft, ChevronRight, Eye, Edit2, MoreHorizontal,
  Download, X, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";

interface Content {
  id: string;
  title: string;
  platform: string;
  status: "draft" | "published";
  outputLanguage: string;
  generatedContent: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const PLATFORMS = [
  "", "Facebook Post", "Facebook Ad Copy", "Instagram Caption", "LinkedIn Post",
  "X (Twitter) Post", "TikTok Caption", "YouTube Description", "Telegram Post", "Blog",
];

const PLATFORM_ICONS: Record<string, string> = {
  "Facebook Post": "📘", "Facebook Ad Copy": "📘", "Instagram Caption": "📸",
  "LinkedIn Post": "💼", "X (Twitter) Post": "🐦", "TikTok Caption": "🎵",
  "YouTube Description": "▶️", "Telegram Post": "✈️", "Blog": "📝",
};

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      status === "published"
        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
        : "bg-amber-500/15 text-amber-300 border border-amber-500/25"
    }`}>
      {status === "published" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

function ContentModal({ content, onClose, onUpdate }: {
  content: Content; onClose: () => void;
  onUpdate: (id: string, data: Partial<Content>) => void;
}) {
  const [text, setText] = useState(content.generatedContent);
  const [saving, setSaving] = useState(false);

  const save = async (status?: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${content.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatedContent: text, ...(status ? { status } : {}) }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      onUpdate(content.id, updated);
      toast.success(status === "published" ? "Published!" : "Saved!");
      onClose();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-white text-lg">{content.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-400">{PLATFORM_ICONS[content.platform]} {content.platform}</span>
              <StatusBadge status={content.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none text-sm"
          />
        </div>
        <div className="flex items-center gap-3 p-6 border-t border-slate-800">
          <Button onClick={onClose} variant="outline" className="border-slate-700 text-slate-300">Cancel</Button>
          <Button onClick={() => save()} disabled={saving} variant="outline" className="border-amber-500/40 text-amber-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${saving ? "animate-spin" : ""}`} />
            Save Changes
          </Button>
          {content.status === "draft" && (
            <Button onClick={() => save("published")} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [contents, setContents] = useState<Content[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingContent, setViewingContent] = useState<Content | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; isBulk: boolean }>({
    isOpen: false,
    id: null,
    isBulk: false,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetch_contents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(platformFilter && { platform: platformFilter }),
      ...(languageFilter && { outputLanguage: languageFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    try {
      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      setContents(data.contents ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, platformFilter, languageFilter, startDate, endDate]);

  useEffect(() => { fetch_contents(); }, [fetch_contents]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => setSelectedIds(contents.map((c) => c.id));
  const clearSelection = () => setSelectedIds([]);

  const handleBulkAction = async (action: "publish" | "delete") => {
    if (!selectedIds.length) return;
    if (action === "delete") {
      setDeleteModal({ isOpen: true, id: null, isBulk: true });
      return;
    }
    await executeBulkAction(action);
  };

  const executeBulkAction = async (action: "publish" | "delete") => {
    try {
      const res = await fetch("/api/content/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${selectedIds.length} item(s) ${action === "delete" ? "deleted" : "published"}!`);
      clearSelection();
      fetch_contents();
    } catch {
      toast.error("Bulk action failed");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteModal({ isOpen: true, id, isBulk: false });
  };

  const executeDelete = async () => {
    const id = deleteModal.id;
    if (!id && !deleteModal.isBulk) return;

    if (deleteModal.isBulk) {
      await executeBulkAction("delete");
      setDeleteModal({ isOpen: false, id: null, isBulk: false });
      return;
    }

    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted!");
      fetch_contents();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteModal({ isOpen: false, id: null, isBulk: false });
    }
  };

  const handleStatusChange = async (id: string, status: "draft" | "published") => {
    try {
      await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(status === "published" ? "Published!" : "Moved to draft!");
      fetch_contents();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleContentUpdate = (id: string, data: Partial<Content>) => {
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </span>
            Content Library
          </h1>
          <p className="text-slate-400 mt-1">{total} total content items</p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg text-sm"
        >
          + Create New
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={platformFilter}
                onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none"
              >
                <option value="">All Platforms</option>
                {PLATFORMS.slice(1).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={languageFilter}
                onChange={(e) => { setLanguageFilter(e.target.value); setPage(1); }}
                className="pl-4 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Myanmar (Burmese)">Myanmar</option>
                <option value="English + Myanmar">Mix</option>
                <option value="Business English">Business</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/50"
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <span className="text-violet-300 text-sm font-medium">{selectedIds.length} selected</span>
          <Button onClick={() => handleBulkAction("publish")} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Publish All
          </Button>
          <Button onClick={() => handleBulkAction("delete")} size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-1" /> Delete All
          </Button>
          <Button onClick={clearSelection} size="sm" variant="ghost" className="text-slate-400">
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-8">
            <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No content found</p>
            <p className="text-slate-600 text-sm mt-1">Create your first content to get started</p>
          </div>
        ) : (
          <>
            {/* Header row */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-800 bg-slate-800/30">
              <input
                type="checkbox"
                checked={selectedIds.length === contents.length}
                onChange={() => selectedIds.length === contents.length ? clearSelection() : selectAll()}
                className="rounded border-slate-600 accent-violet-500"
              />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-1">Title</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 hidden md:block">Platform</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Status</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 hidden lg:block">Date</span>
              {isAdmin && <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 hidden xl:block">User</span>}
              <span className="w-10" />
            </div>

            {/* Content rows */}
            {contents.map((content) => (
              <div
                key={content.id}
                className={`flex items-center gap-4 px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                  selectedIds.includes(content.id) ? "bg-violet-500/5" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(content.id)}
                  onChange={() => toggleSelect(content.id)}
                  className="rounded border-slate-600 accent-violet-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 truncate">{content.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {content.generatedContent.slice(0, 80)}...
                  </p>
                </div>
                <div className="w-32 hidden md:flex items-center gap-1.5 text-sm text-slate-400 shrink-0">
                  <span>{PLATFORM_ICONS[content.platform]}</span>
                  <span className="truncate">{content.platform}</span>
                </div>
                <div className="w-24 shrink-0">
                  <StatusBadge status={content.status} />
                </div>
                <div className="w-28 text-xs text-slate-500 shrink-0 hidden lg:block">
                  {new Date(content.createdAt).toLocaleDateString()}
                </div>
                {isAdmin && (
                  <div className="w-28 text-xs text-slate-500 shrink-0 hidden xl:block truncate">
                    {content.user?.name}
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  } />
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl">
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-slate-800 gap-2"
                      onClick={() => setViewingContent(content)}
                    >
                      <Eye className="w-4 h-4" /> View & Edit
                    </DropdownMenuItem>
                    {content.status === "draft" && (
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-slate-800 gap-2 text-emerald-400"
                        onClick={() => handleStatusChange(content.id, "published")}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Publish
                      </DropdownMenuItem>
                    )}
                    {content.status === "published" && (
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-slate-800 gap-2 text-amber-400"
                        onClick={() => handleStatusChange(content.id, "draft")}
                      >
                        <Clock className="w-4 h-4" /> Move to Draft
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-red-500/10 gap-2 text-red-400"
                      onClick={() => handleDelete(content.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-slate-400">
                  Page {page} of {totalPages} · {total} items
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm" variant="outline"
                    className="border-slate-700 text-slate-300"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="border-slate-700 text-slate-300"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Content Modal */}
      {viewingContent && (
        <ContentModal
          content={viewingContent}
          onClose={() => setViewingContent(null)}
          onUpdate={handleContentUpdate}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, isBulk: false })}
        onConfirm={executeDelete}
        title={deleteModal.isBulk ? "Delete Multiple Contents" : "Delete Content"}
        description={
          deleteModal.isBulk
            ? `Are you sure you want to delete ${selectedIds.length} items? This action cannot be undone.`
            : "Are you sure you want to delete this content? This action cannot be undone."
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
