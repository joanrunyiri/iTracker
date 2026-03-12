"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, api } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { login } = useAuth();
  const [tenantName, setTenantName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        tenantName,
        name,
        email,
        password,
      });
      toast.success("Organization created successfully!");
      login(res.data.token, res.data.user);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.[0]?.message ||
        err.response?.data?.error ||
        "Registration failed";
      toast.error(
        typeof errorMsg === "string" ? errorMsg : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              iTracker
            </h1>
            <p className="text-stone-500 mt-2">
              Create your organization space
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="Acme Corp"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="you@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? "Creating..." : "Create workspace"}
            </button>
          </form>
        </div>

        <div className="bg-stone-50 p-6 text-center border-t border-stone-100">
          <p className="text-stone-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
