import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, ExternalLink, Flag } from "lucide-react"

export default function OrgEventsPage() {
  const events = [
    {
      id: 1,
      suspect: "company_official_real",
      target: "@company",
      campaign: "#brandcampaign2024",
      confidence: 94,
      signals: ["Username: 98%", "Image: 90%"],
      timestamp: "2024-01-15 14:30",
      status: "pending",
      reviewer: null,
    },
    {
      id: 2,
      suspect: "company_verified_team",
      target: "@company_support",
      campaign: "@company",
      confidence: 89,
      signals: ["Username: 85%", "Image: 93%"],
      timestamp: "2024-01-15 11:20",
      status: "flagged",
      reviewer: "Sarah Chen",
    },
    {
      id: 3,
      suspect: "c0mpany_news",
      target: "@company_news",
      campaign: "#companynews",
      confidence: 86,
      signals: ["Username: 92%", "Bio: 80%"],
      timestamp: "2024-01-14 16:45",
      status: "reviewed",
      reviewer: "Mike Johnson",
    },
    {
      id: 4,
      suspect: "company.support.help",
      target: "@company_support",
      campaign: "@company_support",
      confidence: 78,
      signals: ["Username: 81%", "Bio: 75%"],
      timestamp: "2024-01-14 09:15",
      status: "dismissed",
      reviewer: "Emily Davis",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      reviewed: "outline",
      flagged: "destructive",
      dismissed: "default",
    }
    return variants[status] || "default"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Events</h1>
            <p className="text-muted-foreground">All impersonation events across monitored accounts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Flag className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by suspect or target..." className="pl-10" />
          </div>
          <Select defaultValue="all-accounts">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-accounts">All Accounts</SelectItem>
              <SelectItem value="company">@company</SelectItem>
              <SelectItem value="company_support">@company_support</SelectItem>
              <SelectItem value="company_news">@company_news</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Events Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Suspect</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{event.suspect[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">@{event.suspect}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{event.target}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {event.campaign}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-destructive">{event.confidence}%</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{event.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(event.status)} className="capitalize">
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{event.reviewer || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing 1-4 of 127 events</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
