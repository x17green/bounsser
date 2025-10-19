import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, Edit, Trash2, Hash, AtSign } from "lucide-react"

export default function StreamRulesPage() {
  const rules = [
    {
      id: 1,
      type: "hashtag",
      value: "#brandcampaign2024",
      status: "active",
      matches: 1234,
      created: "2024-01-10",
    },
    {
      id: 2,
      type: "mention",
      value: "@company",
      status: "active",
      matches: 5678,
      created: "2024-01-05",
    },
    {
      id: 3,
      type: "hashtag",
      value: "#companyproduct",
      status: "active",
      matches: 892,
      created: "2024-01-15",
    },
    {
      id: 4,
      type: "mention",
      value: "@company_support",
      status: "paused",
      matches: 234,
      created: "2024-01-12",
    },
    {
      id: 5,
      type: "hashtag",
      value: "#companynews",
      status: "active",
      matches: 456,
      created: "2024-01-08",
    },
  ]

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stream Rules</h1>
            <p className="text-muted-foreground">Configure monitoring rules for hashtags and mentions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rules..." className="pl-10" />
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About Stream Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Stream rules define what content Bouncer monitors for impersonation attempts. Add hashtags from your
                  campaigns or mentions of your official accounts to track suspicious activity in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {rule.type === "hashtag" ? (
                      <Hash className="w-6 h-6 text-primary" />
                    ) : (
                      <AtSign className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  {/* Rule Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.value}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {rule.type}
                      </Badge>
                      <Badge
                        variant={rule.status === "active" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {rule.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{rule.matches.toLocaleString()} matches</span>
                      <span>Created {rule.created}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked={rule.status === "active"} />
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Rules</div>
              <div className="text-3xl font-bold">{rules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Active Rules</div>
              <div className="text-3xl font-bold text-success">{rules.filter((r) => r.status === "active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Matches</div>
              <div className="text-3xl font-bold">{rules.reduce((sum, r) => sum + r.matches, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
