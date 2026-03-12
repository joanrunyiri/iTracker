"use client";

import { useAuth } from "../../context/AuthContext";
import { LayoutTemplate, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  console.log(user);
  if (!user) return null;

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-stone-900 text-white p-2 rounded-lg">
                <LayoutTemplate size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-stone-900">
                iTracker
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-stone-900 bg-stone-100"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                Issues
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === "/settings"
                    ? "text-stone-900 bg-stone-100"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Users size={16} />
                Team
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-stone-500">Workspace</span>
              <span className="text-sm font-medium bg-stone-100 px-3 py-1 rounded-full text-stone-800">
                {user.tenantName}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
