"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Flag,
  Bell,
  Settings,
  Building2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfile from "@/components/auth/UserProfile";
import { useAuth } from "@/lib/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  mode?: "personal" | "organization";
}

export function DashboardLayout({
  children,
  mode = "personal",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const personalNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/events", icon: AlertTriangle, label: "Events" },
    { href: "/dashboard/flags", icon: Flag, label: "Flags" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const orgNavItems = [
    { href: "/org/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/org/accounts", icon: User, label: "Accounts" },
    { href: "/org/rules", icon: Settings, label: "Stream Rules" },
    { href: "/org/events", icon: AlertTriangle, label: "Events" },
    { href: "/org/reports", icon: Flag, label: "Reports" },
    { href: "/org/team", icon: Building2, label: "Team" },
  ];

  const navItems = mode === "personal" ? personalNavItems : orgNavItems;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Bouncer</span>
          </Link>
        </div>

        {/* Mode Switcher */}
        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent"
              >
                <span className="flex items-center gap-2">
                  {mode === "personal" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                  {mode === "personal" ? "Personal" : "Organization"}
                </span>
                <svg
                  className="w-4 h-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Personal Mode
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/org/dashboard" className="cursor-pointer">
                  <Building2 className="w-4 h-4 mr-2" />
                  Organization Mode
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <UserProfile className="w-full justify-start" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
