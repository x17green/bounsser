"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Shield,
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  const metrics = {
    totalDetections: { value: 234, change: 12, trend: "up" },
    falsePositiveRate: { value: 3.2, change: -0.8, trend: "down" },
    avgDetectionTime: { value: "1.8min", change: -0.3, trend: "down" },
    accountsProtected: { value: 12, change: 0, trend: "neutral" },
  }

  const detectionsByDay = [
    { day: "Mon", detections: 28, flagged: 18, dismissed: 10 },
    { day: "Tue", detections: 35, flagged: 22, dismissed: 13 },
    { day: "Wed", detections: 42, flagged: 28, dismissed: 14 },
    { day: "Thu", detections: 38, flagged: 25, dismissed: 13 },
    { day: "Fri", detections: 45, flagged: 30, dismissed: 15 },
    { day: "Sat", detections: 32, flagged: 20, dismissed: 12 },
    { day: "Sun", detections: 24, flagged: 15, dismissed: 9 },
  ]

  const signalContribution = [
    { signal: "Username Similarity", percentage: 38, count: 89 },
    { signal: "Image Match", percentage: 28, count: 66 },
    { signal: "Bio Similarity", percentage: 22, count: 51 },
    { signal: "Follower Overlap", percentage: 12, count: 28 },
  ]

  const topTargets = [
    { handle: "@company", threats: 89, flagged: 56, dismissed: 33 },
    { handle: "@company_support", threats: 67, flagged: 42, dismissed: 25 },
    { handle: "@company_news", threats: 45, flagged: 28, dismissed: 17 },
    { handle: "@company_careers", threats: 33, flagged: 20, dismissed: 13 },
  ]

  const commonPatterns = [
    { pattern: "Homoglyph substitution (o→0)", occurrences: 45 },
    { pattern: "Fake verification badge", occurrences: 38 },
    { pattern: "Similar profile image", occurrences: 34 },
    { pattern: "Underscore variations", occurrences: 28 },
    { pattern: "Domain impersonation", occurrences: 22 },
  ]

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-destructive" />
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-success" />
    return null
  }

  const getTrendColor = (trend: string, isPositive: boolean) => {
    if (trend === "neutral") return "text-muted-foreground"
    if (trend === "up") return isPositive ? "text-success" : "text-destructive"
    if (trend === "down") return isPositive ? "text-destructive" : "text-success"
    return "text-muted-foreground"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
            <p className="text-muted-foreground">Track detection trends and system performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Total Detections</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{metrics.totalDetections.value}</div>
                <div
                  className={`text-sm flex items-center gap-1 ${getTrendColor(metrics.totalDetections.trend, false)}`}
                >
                  {getTrendIcon(metrics.totalDetections.trend)}
                  {metrics.totalDetections.change > 0 ? "+" : ""}
                  {metrics.totalDetections.change}% from last period
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">False Positive Rate</div>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{metrics.falsePositiveRate.value}%</div>
                <div
                  className={`text-sm flex items-center gap-1 ${getTrendColor(metrics.falsePositiveRate.trend, true)}`}
                >
                  {getTrendIcon(metrics.falsePositiveRate.trend)}
                  {metrics.falsePositiveRate.change > 0 ? "+" : ""}
                  {metrics.falsePositiveRate.change}% from last period
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Avg Detection Time</div>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{metrics.avgDetectionTime.value}</div>
                <div
                  className={`text-sm flex items-center gap-1 ${getTrendColor(metrics.avgDetectionTime.trend, true)}`}
                >
                  {getTrendIcon(metrics.avgDetectionTime.trend)}
                  {Math.abs(metrics.avgDetectionTime.change)}min faster
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-muted-foreground">Accounts Protected</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{metrics.accountsProtected.value}</div>
                <div className="text-sm text-muted-foreground">Active monitoring</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detections Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Detections Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detectionsByDay.map((day, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-muted-foreground">{day.detections} total</span>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div
                        className="bg-destructive rounded-sm flex items-center justify-center text-xs text-destructive-foreground font-medium"
                        style={{ width: `${(day.flagged / day.detections) * 100}%` }}
                      >
                        {day.flagged > 5 && day.flagged}
                      </div>
                      <div
                        className="bg-muted rounded-sm flex items-center justify-center text-xs text-muted-foreground font-medium"
                        style={{ width: `${(day.dismissed / day.detections) * 100}%` }}
                      >
                        {day.dismissed > 5 && day.dismissed}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-destructive" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <span>Dismissed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signal Contribution */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Signal Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signalContribution.map((signal, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{signal.signal}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{signal.count} cases</span>
                        <span className="text-sm font-semibold">{signal.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-1 rounded-full" style={{ width: `${signal.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Targeted Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Most Targeted Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTargets.map((target, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{target.handle}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {target.threats} threats
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {target.flagged} flagged
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {target.dismissed} dismissed
                        </span>
                      </div>
                    </div>
                    <Badge variant="destructive">{target.threats}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Attack Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Common Attack Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonPatterns.map((pattern, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{pattern.pattern}</span>
                    <Badge variant="outline">{pattern.occurrences} cases</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary mb-2">
                  {detectionsByDay.reduce((sum, day) => sum + day.detections, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Detections</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-destructive mb-2">
                  {detectionsByDay.reduce((sum, day) => sum + day.flagged, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Flagged as Threats</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-muted-foreground mb-2">
                  {detectionsByDay.reduce((sum, day) => sum + day.dismissed, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Dismissed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-success mb-2">96.8%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
