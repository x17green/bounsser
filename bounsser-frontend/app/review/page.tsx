"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle,
  XCircle,
  Flag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  ImageIcon,
  FileText,
  Users,
  Keyboard,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function ReviewQueuePage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"flag" | "dismiss" | null>(null)

  const queueItems = [
    {
      id: 1,
      suspect: {
        handle: "john_d0e",
        displayName: "John Doe",
        avatar: "/placeholder.svg",
        bio: "Tech enthusiast | Crypto investor | DM for collabs",
        followers: 234,
        following: 456,
        verified: false,
        created: "2024-01-10",
      },
      target: {
        handle: "johndoe",
        displayName: "John Doe",
      },
      confidence: 78,
      signals: {
        username: 92,
        image: 88,
        bio: 45,
        follower: 12,
      },
      timestamp: "2024-01-15 14:30",
      assignedTo: null,
      priority: "medium",
    },
    {
      id: 2,
      suspect: {
        handle: "company_verified",
        displayName: "Company ✓",
        avatar: "/placeholder.svg",
        bio: "Official company account | Customer support available 24/7",
        followers: 1203,
        following: 89,
        verified: false,
        created: "2024-01-12",
      },
      target: {
        handle: "company",
        displayName: "Company",
      },
      confidence: 72,
      signals: {
        username: 85,
        image: 76,
        bio: 68,
        follower: 8,
      },
      timestamp: "2024-01-15 11:20",
      assignedTo: "Sarah Chen",
      priority: "high",
    },
    {
      id: 3,
      suspect: {
        handle: "brand_support_help",
        displayName: "Brand Support",
        avatar: "/placeholder.svg",
        bio: "Here to help! Send us a DM for assistance",
        followers: 567,
        following: 234,
        verified: false,
        created: "2024-01-14",
      },
      target: {
        handle: "brand_support",
        displayName: "Brand Support",
      },
      confidence: 68,
      signals: {
        username: 79,
        image: 65,
        bio: 72,
        follower: 15,
      },
      timestamp: "2024-01-14 16:45",
      assignedTo: null,
      priority: "low",
    },
  ]

  const toggleSelection = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleExpand = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-warning"
      case "low":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return "text-destructive"
    if (score >= 60) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Queue</h1>
            <p className="text-muted-foreground">Human review for medium-confidence impersonation cases</p>
          </div>
          <Button variant="outline" className="bg-transparent">
            <Keyboard className="w-4 h-4 mr-2" />
            Keyboard Shortcuts
          </Button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="unassigned">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned to Me</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-sm">
              {queueItems.length} items in queue
            </Badge>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedItems.length} selected</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setActionType("flag")
                  setShowActionDialog(true)
                }}
              >
                <Flag className="w-4 h-4 mr-2" />
                Flag All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  setActionType("dismiss")
                  setShowActionDialog(true)
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Dismiss All
              </Button>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Keyboard className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Keyboard Shortcuts</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <kbd className="px-2 py-1 bg-muted rounded">j/k</kbd> Navigate items
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-muted rounded">y</kbd> Flag as impersonator
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-muted rounded">n</kbd> Dismiss
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-muted rounded">r</kbd> Add review note
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Items */}
        <div className="space-y-4">
          {queueItems.map((item) => (
            <Card key={item.id} className={expandedItem === item.id ? "border-primary" : ""}>
              <CardContent className="p-6">
                {/* Main Row */}
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />

                  <Avatar className="w-12 h-12">
                    <AvatarImage src={item.suspect.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{item.suspect.handle[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.suspect.displayName}</h3>
                          <span className="text-sm text-muted-foreground">@{item.suspect.handle}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Suspected impersonation of{" "}
                          <span className="font-medium text-foreground">@{item.target.handle}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(item.priority) + " capitalize"}>
                          {item.priority}
                        </Badge>
                        <Badge variant="secondary" className={getConfidenceColor(item.confidence)}>
                          {item.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-medium">{item.signals.username}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Image:</span>
                        <span className="font-medium">{item.signals.image}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bio:</span>
                        <span className="font-medium">{item.signals.bio}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Followers:</span>
                        <span className="font-medium">{item.signals.follower}%</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedItem === item.id && (
                      <div className="pt-4 border-t border-border space-y-4">
                        {/* Suspect Profile Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Bio:</span>
                            <p className="mt-1">{item.suspect.bio}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-muted-foreground">Followers:</span>
                              <p className="font-medium mt-1">{item.suspect.followers.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Following:</span>
                              <p className="font-medium mt-1">{item.suspect.following.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <p className="font-medium mt-1">{item.suspect.created}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Verified:</span>
                              <p className="font-medium mt-1">{item.suspect.verified ? "Yes" : "No"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Signal Breakdown */}
                        <div>
                          <p className="text-sm font-medium mb-3">Detection Signal Breakdown</p>
                          <div className="space-y-2">
                            {Object.entries(item.signals).map(([key, value]) => (
                              <div key={key}>
                                <div className="flex items-center justify-between mb-1 text-sm">
                                  <span className="capitalize">{key} Similarity</span>
                                  <span className="font-medium">{value}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${value >= 80 ? "bg-destructive" : value >= 60 ? "bg-warning" : "bg-chart-1"}`}
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Review Notes */}
                        <div>
                          <Label htmlFor={`notes-${item.id}`} className="text-sm font-medium mb-2 block">
                            Review Notes (Optional)
                          </Label>
                          <Textarea
                            id={`notes-${item.id}`}
                            placeholder="Add your reasoning or observations..."
                            className="min-h-20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.timestamp}</span>
                        {item.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to {item.assignedTo}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)}>
                          {expandedItem === item.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Less Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              More Details
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <XCircle className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Flag className="w-4 h-4 mr-2" />
                          Flag as Impersonator
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (hidden when there are items) */}
        {queueItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Queue is Empty</h3>
              <p className="text-muted-foreground">All items have been reviewed. Great work!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "flag" ? "Flag Selected Items" : "Dismiss Selected Items"}</DialogTitle>
            <DialogDescription>
              {actionType === "flag"
                ? `You are about to flag ${selectedItems.length} item(s) as impersonators. This will trigger automated actions based on your settings.`
                : `You are about to dismiss ${selectedItems.length} item(s). They will be marked as false positives.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="bulk-notes">Reason (Optional)</Label>
              <Textarea id="bulk-notes" placeholder="Add notes for this bulk action..." className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "flag" ? "destructive" : "default"}
              onClick={() => {
                setShowActionDialog(false)
                setSelectedItems([])
              }}
            >
              {actionType === "flag" ? "Flag All" : "Dismiss All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
