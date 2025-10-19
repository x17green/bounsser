import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, Settings, Trash2, ExternalLink } from "lucide-react"

export default function AccountsPage() {
  const accounts = [
    {
      id: 1,
      handle: "@company",
      displayName: "Company Official",
      followers: 125000,
      verified: true,
      status: "active",
      threatsDetected: 34,
      lastChecked: "2 minutes ago",
    },
    {
      id: 2,
      handle: "@company_support",
      displayName: "Company Support",
      followers: 45000,
      verified: true,
      status: "active",
      threatsDetected: 18,
      lastChecked: "5 minutes ago",
    },
    {
      id: 3,
      handle: "@company_news",
      displayName: "Company News",
      followers: 89000,
      verified: true,
      status: "active",
      threatsDetected: 12,
      lastChecked: "10 minutes ago",
    },
    {
      id: 4,
      handle: "@company_careers",
      displayName: "Company Careers",
      followers: 23000,
      verified: false,
      status: "paused",
      threatsDetected: 0,
      lastChecked: "2 hours ago",
    },
  ]

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Monitored Accounts</h1>
            <p className="text-muted-foreground">Manage official accounts protected by Bouncer</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-10" />
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{account.handle[1]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Account Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{account.displayName}</h3>
                          {account.verified && (
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.handle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.status === "active" ? "default" : "secondary"} className="capitalize">
                          {account.status}
                        </Badge>
                        <Switch defaultChecked={account.status === "active"} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Followers</span>
                        <p className="font-semibold mt-1">{account.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threats Detected</span>
                        <p className="font-semibold mt-1 text-destructive">{account.threatsDetected}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Checked</span>
                        <p className="font-semibold mt-1">{account.lastChecked}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent text-destructive border-destructive/50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
