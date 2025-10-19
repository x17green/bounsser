import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, XCircle, ExternalLink, MessageSquare } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      suspect: "company_official_real",
      reporter: "Sarah Chen",
      reason: "Fake verification badge and impersonating official account",
      confidence: 94,
      status: "pending",
      submittedAt: "2024-01-15 14:30",
      evidence: ["Screenshot", "Profile comparison"],
    },
    {
      id: 2,
      suspect: "company_support_help",
      reporter: "Mike Johnson",
      reason: "Scamming users in replies to official posts",
      confidence: 89,
      status: "reviewed",
      submittedAt: "2024-01-15 10:20",
      evidence: ["Tweet screenshots", "User complaints"],
      resolution: "Reported to platform, account suspended",
    },
    {
      id: 3,
      suspect: "c0mpany_team",
      reporter: "Emily Davis",
      reason: "Username similarity with character substitution",
      confidence: 82,
      status: "resolved",
      submittedAt: "2024-01-14 16:45",
      evidence: ["Profile analysis"],
      resolution: "Account removed by platform",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />
      case "reviewed":
        return <MessageSquare className="w-5 h-5 text-primary" />
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-success" />
      default:
        return <XCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewed: "default",
      resolved: "outline",
    }
    return variants[status] || "default"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Track manually reported impersonation cases and their resolution status
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="confidence">Highest Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Status Icon */}
                  <div className="mt-1">{getStatusIcon(report.status)}</div>

                  {/* Report Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{report.suspect[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">@{report.suspect}</h3>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reporter} • {report.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-sm">
                          {report.confidence}%
                        </Badge>
                        <Badge variant={getStatusBadge(report.status)} className="capitalize">
                          {report.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <p className="text-sm font-medium mb-1">Reason:</p>
                      <p className="text-sm text-muted-foreground">{report.reason}</p>
                    </div>

                    {/* Evidence */}
                    <div>
                      <p className="text-sm font-medium mb-2">Evidence:</p>
                      <div className="flex flex-wrap gap-2">
                        {report.evidence.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Resolution (if exists) */}
                    {report.resolution && (
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm font-medium text-success mb-1">Resolution:</p>
                        <p className="text-sm text-muted-foreground">{report.resolution}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Suspect
                      </Button>
                      {report.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Note
                          </Button>
                          <Button size="sm" className="bg-success hover:bg-success/90">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Resolved
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-warning" />
                <div>
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Under Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
