import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react"

export default function FlagsPage() {
  const flaggedAccounts = [
    {
      id: 1,
      handle: "john_d0e",
      displayName: "John Doe",
      confidence: 92,
      reason: "High username similarity and profile image match",
      flaggedDate: "2024-01-15",
      followers: 234,
      verified: false,
    },
    {
      id: 2,
      handle: "johndoe_official",
      displayName: "John Doe Official",
      confidence: 87,
      reason: "Username similarity and verified badge impersonation",
      flaggedDate: "2024-01-15",
      followers: 1203,
      verified: false,
    },
    {
      id: 3,
      handle: "johndoe_verified",
      displayName: "John Doe ✓",
      confidence: 84,
      reason: "Fake verification badge in display name",
      flaggedDate: "2024-01-13",
      followers: 567,
      verified: false,
    },
    {
      id: 4,
      handle: "j0hndoe",
      displayName: "John Doe",
      confidence: 78,
      reason: "Username with character substitution",
      flaggedDate: "2024-01-14",
      followers: 89,
      verified: false,
    },
  ]

  return (
    <DashboardLayout mode="personal">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Flagged Accounts</h1>
          <p className="text-muted-foreground">Review and manage accounts flagged as potential impersonators</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search flagged accounts..." className="pl-10" />
        </div>

        {/* Flagged Accounts Grid */}
        <div className="grid gap-6">
          {flaggedAccounts.map((account) => (
            <Card key={account.id} className="border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar and Info */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`/placeholder_64px.png?height=64&width=64`} />
                    <AvatarFallback>{account.handle[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{account.displayName}</h3>
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">@{account.handle}</p>
                      </div>
                      <Badge variant="destructive" className="text-sm">
                        {account.confidence}% Match
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reason:</span>
                        <p className="font-medium mt-1">{account.reason}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Flagged:</span>
                        <p className="font-medium mt-1">{account.flaggedDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Followers:</span>
                        <p className="font-medium mt-1">{account.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verified:</span>
                        <p className="font-medium mt-1">{account.verified ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent text-success border-success/50">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Safe
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Report to Platform
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (hidden when there are flags) */}
        {flaggedAccounts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Flagged Accounts</h3>
              <p className="text-muted-foreground">All clear! No suspicious accounts have been detected.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
