"use client";

import { useEffect, useState, use } from "react";
import { useAuth, api } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, History, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";

export default function IssueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [issue, setIssue] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchIssue = async () => {
    try {
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data);
    } catch (error) {
      toast.error("Issue not found or unauthorized");
      router.push("/");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      router.push("/login");
    } else if (user && token) {
      fetchIssue();
    }
  }, [user, token, isLoading, router, id]);

  const updateStatus = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      await api.put(`/issues/${id}`, { status: newStatus });
      toast.success("Status updated");
      fetchIssue(); // Re-fetch to get new audit logs
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  if (isLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse w-8 h-8 rounded-full border-4 border-stone-200 border-t-stone-800 animate-spin" />
      </div>
    );
  }

  if (!issue) return null;

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-800 ring-blue-600/20",
    IN_PROGRESS: "bg-amber-100 text-amber-800 ring-amber-600/20",
    RESOLVED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    CLOSED: "bg-stone-100 text-stone-800 ring-stone-500/20",
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                {issue.title}
              </h1>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ring-1 ring-inset whitespace-nowrap ${
                  statusColors[issue.status]
                }`}
              >
                {issue.status.replace("_", " ")}
              </span>
            </div>

            <div className="prose prose-stone max-w-none text-stone-600 mb-8 whitespace-pre-wrap">
              {issue.description || <span className="italic text-stone-400">No description provided.</span>}
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-stone-100 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Opened {formatDistanceToNow(new Date(issue.createdAt))} ago</span>
              </div>
            </div>
          </div>

          {/* Audit Logs / Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="flex items-center gap-2 mb-6">
              <History className="text-stone-400" size={20} />
              <h2 className="text-lg font-semibold text-stone-900">Activity Timeline</h2>
            </div>
            
            <div className="space-y-6">
              {issue.auditLogs?.length > 0 ? (
                <div className="relative border-l-2 border-stone-100 ml-3 space-y-8 pb-4">
                  {issue.auditLogs.map((log: any, idx: number) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-stone-200 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          <span className="font-semibold text-stone-900">
                            {log.user.name}
                          </span>{" "}
                          <span className="text-stone-600">{log.details}</span>
                        </div>
                        <span className="text-xs text-stone-400 font-mono">
                          {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Initial creation node */}
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                    <div className="flex flex-col gap-1">
                      <div className="text-sm">
                        <span className="text-stone-600">Issue opened</span>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">
                        {format(new Date(issue.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-stone-500 text-sm flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wider">
              Actions
            </h3>
            <div className="space-y-3">
              <label className="text-xs font-medium text-stone-500 block">
                Update Status
              </label>
              <select
                value={issue.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={statusLoading}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
