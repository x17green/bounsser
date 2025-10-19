"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  ExternalLink,
  Flag,
  CheckCircle,
  XCircle,
  User,
  ImageIcon,
  FileText,
  Users,
  Shield,
  MessageSquare,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

export default function SuspectDetailPage() {
  // Mock data - would come from API based on [id]
  const suspect = {
    handle: "john_d0e",
    displayName: "John Doe",
    avatar: "/placeholder.svg",
    bio: "Tech enthusiast | Crypto investor | DM for collabs 💰",
    followers: 234,
    following: 456,
    verified: false,
    created: "2024-01-10",
    location: "New York, NY",
    website: "crypto-deals.xyz",
  }

  const target = {
    handle: "johndoe",
    displayName: "John Doe",
    avatar: "/placeholder.svg",
    bio: "Tech enthusiast and software developer. Building cool things.",
    followers: 45000,
    following: 892,
    verified: true,
    created: "2019-03-15",
    location: "San Francisco, CA",
    website: "johndoe.com",
  }

  const analysis = {
    confidence: 92,
    signals: {
      username: { score: 96, details: "Homoglyph substitution: 'o' → '0'" },
      image: { score: 88, details: "Perceptual hash distance: 0.12 (very similar)" },
      bio: { score: 45, details: "Partial keyword overlap, different tone" },
      follower: { score: 12, details: "8 mutual followers detected" },
    },
    timeline: [
      { timestamp: "2024-01-15 14:30:15", action: "Initial detection via filtered stream" },
      { timestamp: "2024-01-15 14:30:18", action: "Lightweight checks completed" },
      { timestamp: "2024-01-15 14:30:22", action: "Deep image analysis completed" },
      { timestamp: "2024-01-15 14:30:25", action: "Follower overlap analysis completed" },
      { timestamp: "2024-01-15 14:30:28", action: "Added to review queue (confidence: 92%)" },
    ],
    recentActivity: [
      { type: "reply", content: "Hey! Check out this amazing crypto opportunity...", timestamp: "2 hours ago" },
      { type: "mention", content: "@johndoe I can help you with that! DM me", timestamp: "3 hours ago" },
      { type: "reply", content: "Free giveaway! Click here: [suspicious-link]", timestamp: "5 hours ago" },
    ],
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-destructive"
    if (score >= 60) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/review">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Queue
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-1">Suspect Analysis</h1>
              <p className="text-muted-foreground">Detailed comparison and evidence review</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {analysis.confidence}% Confidence
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Comparison */}
          <div className="lg:col-span-2 space-y-6">
            {/* Side-by-Side Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Suspect Profile */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold text-lg">Suspect Account</h3>
                    </div>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={suspect.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{suspect.handle[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{suspect.displayName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">@{suspect.handle}</p>
                        {suspect.verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bio:</span>
                        <p className="mt-1">{suspect.bio}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Followers:</span>
                          <p className="font-medium">{suspect.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Following:</span>
                          <p className="font-medium">{suspect.following.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">{suspect.created}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{suspect.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Website:</span>
                        <p className="font-medium text-destructive">{suspect.website}</p>
                      </div>
                    </div>
                  </div>

                  {/* Target Profile */}
                  <div className="space-y-4 border-l border-border pl-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-lg">Target Account</h3>
                    </div>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={target.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{target.handle[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{target.displayName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">@{target.handle}</p>
                        {target.verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bio:</span>
                        <p className="mt-1">{target.bio}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Followers:</span>
                          <p className="font-medium">{target.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Following:</span>
                          <p className="font-medium">{target.following.toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">{target.created}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{target.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Website:</span>
                        <p className="font-medium text-success">{target.website}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detection Signals */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Signal Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(analysis.signals).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {key === "username" && <User className="w-4 h-4 text-muted-foreground" />}
                        {key === "image" && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                        {key === "bio" && <FileText className="w-4 h-4 text-muted-foreground" />}
                        {key === "follower" && <Users className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium capitalize">{key} Similarity</span>
                      </div>
                      <span className={`font-bold text-lg ${getScoreColor(data.score)}`}>{data.score}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${data.score >= 80 ? "bg-destructive" : data.score >= 60 ? "bg-warning" : "bg-chart-1"}`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{data.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Suspicious Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm">{activity.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Action Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="review-notes">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add your reasoning or observations..."
                    className="mt-2 min-h-24"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button className="w-full bg-destructive hover:bg-destructive/90">
                    <Flag className="w-4 h-4 mr-2" />
                    Flag as Impersonator
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Safe
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Platform
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detection Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {i < analysis.timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Age</span>
                  <Badge variant="destructive" className="text-xs">
                    New (5 days)
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Follower Ratio</span>
                  <Badge variant="destructive" className="text-xs">
                    Suspicious (0.51)
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Website Domain</span>
                  <Badge variant="destructive" className="text-xs">
                    Suspicious
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Activity Pattern</span>
                  <Badge variant="destructive" className="text-xs">
                    Spam-like
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
