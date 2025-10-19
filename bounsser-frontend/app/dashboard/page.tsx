"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { StatCard } from "@/components/stat-card";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Flag,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/services/api";

interface DashboardStats {
  threatsThisWeek: number;
  accountsFlagged: number;
  protectionScore: string;
  detectionRate: string;
}

export default function PersonalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock data for now - replace with actual API call when backend stats are ready
        // const response = await apiService.getAnalytics();
        const mockStats: DashboardStats = {
          threatsThisWeek: 12,
          accountsFlagged: 8,
          protectionScore: "98%",
          detectionRate: "99.2%",
        };
        setStats(mockStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout mode="personal">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.profile?.name || user?.username || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Monitor impersonation attempts and protect your account @
              {user?.username}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  title="Threats This Week"
                  value={stats?.threatsThisWeek ?? 0}
                  change="+3 from last week"
                  changeType="negative"
                  icon={AlertTriangle}
                />
                <StatCard
                  title="Accounts Flagged"
                  value={stats?.accountsFlagged ?? 0}
                  change="+2 from last week"
                  changeType="negative"
                  icon={Flag}
                />
                <StatCard
                  title="Protection Score"
                  value={stats?.protectionScore ?? "0%"}
                  change="+2% from last week"
                  changeType="positive"
                  icon={Shield}
                />
                <StatCard
                  title="Detection Rate"
                  value={stats?.detectionRate ?? "0%"}
                  change="Stable"
                  changeType="neutral"
                  icon={TrendingUp}
                />
              </>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart: Events over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detection Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Username Similarity",
                      value: 85,
                      color: "bg-chart-1",
                    },
                    {
                      label: "Profile Image Match",
                      value: 72,
                      color: "bg-chart-2",
                    },
                    { label: "Bio Similarity", value: 58, color: "bg-chart-3" },
                    {
                      label: "Follower Overlap",
                      value: 34,
                      color: "bg-chart-4",
                    },
                  ].map((signal, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {signal.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {signal.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${signal.color}`}
                          style={{ width: `${signal.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Events</h2>
              <Link href="/dashboard/events">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              <EventCard
                suspectHandle="john_d0e"
                targetHandle="johndoe"
                confidence={92}
                timestamp="2 hours ago"
                signals={["Username: 96%", "Image: 88%", "Bio: 45%"]}
                status="pending"
              />
              <EventCard
                suspectHandle="johndoe_official"
                targetHandle="johndoe"
                confidence={87}
                timestamp="5 hours ago"
                signals={["Username: 82%", "Image: 91%"]}
                status="flagged"
              />
              <EventCard
                suspectHandle="j0hndoe"
                targetHandle="johndoe"
                confidence={78}
                timestamp="1 day ago"
                signals={["Username: 89%", "Bio: 67%"]}
                status="reviewed"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Need to review flagged accounts?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have 3 accounts waiting for your review in the flags
                    section
                  </p>
                </div>
                <Link href="/dashboard/flags">
                  <Button className="bg-primary hover:bg-primary/90">
                    Review Flags
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
