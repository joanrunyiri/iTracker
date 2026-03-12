"use client";

import { useState, useEffect } from "react";
import { useAuth, api } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Shield,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [team, setTeam] = useState<any[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setTeam(res.data);
    } catch (error) {
      console.error("Failed to fetch team members", error);
    } finally {
      setIsTeamLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-stone-200 rounded-full" />
          <div className="h-4 w-32 bg-stone-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/auth/add-user", formData);
      toast.success("User added successfully!");
      setFormData({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to add user";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900">
            Workspace Settings
          </h1>
          <p className="text-stone-500 mt-2">
            Manage your organization and team members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-900 bg-white border border-stone-200 shadow-sm transition-all flex items-center gap-3">
              <UserPlus size={18} />
              Team Management
            </button>
            {/* <button className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-stone-500 hover:bg-stone-100 transition-all flex items-center gap-3 cursor-not-allowed opacity-50">
              <Shield size={18} />
              Organization Security
            </button> */}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Add Team Member
                  </h2>
                  <p className="text-sm text-stone-500">
                    Create a new account for someone in your organization.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700 block">
                    Full Name
                  </label>
                  <div className="relative group">
                    <UserIcon
                      className="absolute left-3 top-3 text-stone-400 group-focus-within:text-stone-900 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3 top-3 text-stone-400 group-focus-within:text-stone-900 transition-colors"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700 block">
                    Temporary Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3 top-3 text-stone-400 group-focus-within:text-stone-900 transition-colors"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white rounded-xl py-3 font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Adding User...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-900">
                  Active Team Members
                </h2>
                <p className="text-sm text-stone-500">
                  People who currently have access to {user.tenantName}.
                </p>
              </div>

              <div className="divide-y divide-stone-100">
                {isTeamLoading ? (
                  <div className="p-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-stone-400"
                      size={24}
                    />
                  </div>
                ) : team.length === 0 ? (
                  <div className="p-12 text-center text-stone-500">
                    No team members found.
                  </div>
                ) : (
                  team.map((member) => (
                    <div
                      key={member.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-semibold border border-stone-200">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {member.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md font-medium">
                        Member
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* <section className="bg-stone-100 border border-stone-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-stone-200 p-2 rounded-lg text-stone-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">
                    Tenant Isolation
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    New users will automatically be linked to{" "}
                    <span className="font-medium text-stone-700">
                      {user.tenantName}
                    </span>
                    . They will only see issues and data belonging to this
                    organization.
                  </p>
                </div>
              </div>
            </section> */}
          </div>
        </div>
      </main>
    </div>
  );
}
