"use client";

import { useEffect, useState } from "react";
import { useAuth, api } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, LayoutTemplate, MoreVertical } from "lucide-react";
import IssueModal from "./components/IssueModal";
import Navbar from "./components/Navbar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      router.push("/login");
    }
  }, [user, token, isLoading, router]);

  const fetchIssues = async () => {
    setIsIssuesLoading(true);
    try {
      const res = await api.get("/issues");
      setIssues(res.data);
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setIsIssuesLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchIssues();
    }
  }, [user, token]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-stone-200 rounded-full" />
          <div className="h-4 w-32 bg-stone-200 rounded" />
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    RESOLVED: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-stone-100 text-stone-800",
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-stone-900">Issues</h1>
            <p className="text-stone-500">
              Manage tasks and track progress within your organization.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Issue
          </button>
        </div>

        {isIssuesLoading ? (
          <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden divide-y divide-stone-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-5 flex items-start justify-between animate-pulse">
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-3 bg-stone-100 rounded" />
                    <div className="w-48 h-4 bg-stone-200 rounded" />
                  </div>
                  <div className="w-3/4 h-3 bg-stone-50 rounded" />
                  <div className="flex gap-4">
                    <div className="w-16 h-5 bg-stone-100 rounded-full" />
                    <div className="w-24 h-3 bg-stone-50 rounded mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
              <LayoutTemplate className="text-stone-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              No issues found
            </h3>
            <p className="text-stone-500 max-w-sm mx-auto mb-6">
              Get started by creating your first issue to track tasks within
              your organization.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 px-5 py-2 rounded-lg font-medium transition-colors inline-block font-medium"
            >
              Create Issue
            </button>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {issues.map((issue) => (
                <li key={issue.id}>
                  <Link
                    href={`/issues/${issue.id}`}
                    className="block hover:bg-stone-50 transition-colors group"
                  >
                    <div className="px-6 py-5 flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-stone-400">
                            {issue.id.split("-")[0]}
                          </span>
                          <span className="font-semibold text-stone-900 group-hover:text-blue-600 transition-colors">
                            {issue.title}
                          </span>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-stone-500 line-clamp-1">
                            {issue.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              statusColors[issue.status] ||
                              "bg-stone-100 text-stone-800"
                            }`}
                          >
                            {issue.status.replace("_", " ")}
                          </span>
                          <span className="text-xs text-stone-400">
                            Opened{" "}
                            {formatDistanceToNow(new Date(issue.createdAt))} ago
                          </span>
                        </div>
                      </div>

                      <div className="text-stone-300 group-hover:text-stone-500 transition-colors">
                        <MoreVertical size={20} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <IssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchIssues}
      />
    </div>
  );
}
