import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Flag, Shield, Users, TrendingUp, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

export default function OrgDashboard() {
  const recentActivity = [
    {
      user: "Sarah Chen",
      action: "flagged account",
      target: "@brand_fake_official",
      time: "5 minutes ago",
    },
    {
      user: "Mike Johnson",
      action: "reviewed event",
      target: "@company_scam",
      time: "12 minutes ago",
    },
    {
      user: "Emily Davis",
      action: "added stream rule",
      target: "#brandcampaign",
      time: "1 hour ago",
    },
  ]

  const topThreats = [
    { handle: "@brand_official_real", confidence: 94, attempts: 23 },
    { handle: "@company_verified", confidence: 89, attempts: 18 },
    { handle: "@brand_support_team", confidence: 86, attempts: 15 },
  ]

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organization Dashboard</h1>
            <p className="text-muted-foreground">Monitor brand protection across all monitored accounts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Flag className="w-4 h-4 mr-2" />
            Report Threat
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Threats Today"
            value={34}
            change="+12% from yesterday"
            changeType="negative"
            icon={AlertTriangle}
          />
          <StatCard
            title="Accounts Monitored"
            value={12}
            change="3 active campaigns"
            changeType="neutral"
            icon={Shield}
          />
          <StatCard title="Team Members" value={8} change="2 active now" changeType="positive" icon={Users} />
          <StatCard
            title="Detection Rate"
            value="99.4%"
            change="+0.2% this week"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat Activity Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Threat Activity by Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chart: Impersonation attempts by hashtag/campaign</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Threats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Threats</CardTitle>
                <Link href="/org/events">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topThreats.map((threat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{threat.handle[1]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{threat.handle}</p>
                      <p className="text-xs text-muted-foreground">{threat.attempts} attempts</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {threat.confidence}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Team Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{activity.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Monitored Accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monitored Accounts</CardTitle>
                <Link href="/org/accounts">
                  <Button variant="ghost" size="sm">
                    Manage
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { handle: "@company", status: "active", threats: 12 },
                { handle: "@company_support", status: "active", threats: 8 },
                { handle: "@company_news", status: "active", threats: 5 },
                { handle: "@company_careers", status: "paused", threats: 0 },
              ].map((account, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{account.handle[1]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{account.handle}</p>
                      <p className="text-xs text-muted-foreground">{account.threats} threats detected</p>
                    </div>
                  </div>
                  <Badge variant={account.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                    {account.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
