import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, ExternalLink } from "lucide-react"

export default function EventsPage() {
  const events = [
    {
      id: 1,
      suspect: "john_d0e",
      target: "johndoe",
      confidence: 92,
      signals: ["Username: 96%", "Image: 88%", "Bio: 45%"],
      timestamp: "2024-01-15 14:30",
      status: "pending",
    },
    {
      id: 2,
      suspect: "johndoe_official",
      target: "johndoe",
      confidence: 87,
      signals: ["Username: 82%", "Image: 91%"],
      timestamp: "2024-01-15 11:20",
      status: "flagged",
    },
    {
      id: 3,
      suspect: "j0hndoe",
      target: "johndoe",
      confidence: 78,
      signals: ["Username: 89%", "Bio: 67%"],
      timestamp: "2024-01-14 16:45",
      status: "reviewed",
    },
    {
      id: 4,
      suspect: "john.doe.real",
      target: "johndoe",
      confidence: 65,
      signals: ["Username: 71%", "Bio: 59%"],
      timestamp: "2024-01-14 09:15",
      status: "dismissed",
    },
    {
      id: 5,
      suspect: "johndoe_verified",
      target: "johndoe",
      confidence: 84,
      signals: ["Username: 88%", "Image: 80%"],
      timestamp: "2024-01-13 18:30",
      status: "flagged",
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

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-destructive font-semibold"
    if (score >= 50) return "text-warning font-semibold"
    return "text-muted-foreground"
  }

  return (
    <DashboardLayout mode="personal">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">All impersonation events detected for your account</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by suspect handle..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High (80-100%)</SelectItem>
              <SelectItem value="medium">Medium (50-79%)</SelectItem>
              <SelectItem value="low">Low (0-49%)</SelectItem>
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
                <TableHead>Suspect Account</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Top Signals</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`/placeholder-32px.png?height=32&width=32`} />
                        <AvatarFallback>{event.suspect[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">@{event.suspect}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">@{event.target}</span>
                  </TableCell>
                  <TableCell>
                    <span className={getConfidenceColor(event.confidence)}>{event.confidence}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {event.signals.slice(0, 2).map((signal, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {signal.split(":")[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{event.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(event.status)} className="capitalize">
                      {event.status}
                    </Badge>
                  </TableCell>
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
          <p className="text-sm text-muted-foreground">Showing 1-5 of 47 events</p>
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
