import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Mail, MoreVertical, Shield, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      role: "Admin",
      status: "active",
      lastActive: "2 minutes ago",
      actionsThisWeek: 45,
    },
    {
      id: 2,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Moderator",
      status: "active",
      lastActive: "15 minutes ago",
      actionsThisWeek: 32,
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@company.com",
      role: "Analyst",
      status: "active",
      lastActive: "1 hour ago",
      actionsThisWeek: 28,
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@company.com",
      role: "Viewer",
      status: "active",
      lastActive: "3 hours ago",
      actionsThisWeek: 5,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
      role: "Moderator",
      status: "inactive",
      lastActive: "2 days ago",
      actionsThisWeek: 0,
    },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="w-4 h-4" />
      case "Moderator":
        return <Edit className="w-4 h-4" />
      case "Analyst":
        return <Eye className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Admin: "default",
      Moderator: "secondary",
      Analyst: "outline",
      Viewer: "outline",
    }
    return variants[role] || "outline"
  }

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">Manage team members and their access permissions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search team members..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Descriptions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Admin
                </div>
                <p className="text-muted-foreground">Full access to all features and settings</p>
              </div>
              <div>
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Edit className="w-4 h-4 text-primary" />
                  Moderator
                </div>
                <p className="text-muted-foreground">Review, flag, and report threats</p>
              </div>
              <div>
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Analyst
                </div>
                <p className="text-muted-foreground">View analytics and generate reports</p>
              </div>
              <div>
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Viewer
                </div>
                <p className="text-muted-foreground">Read-only access to dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Avatar and Info */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge variant={getRoleBadge(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                      {member.status === "inactive" && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-8 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Last Active</div>
                      <div className="font-medium">{member.lastActive}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Actions This Week</div>
                      <div className="font-medium">{member.actionsThisWeek}</div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Members</div>
              <div className="text-3xl font-bold">{teamMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Active Now</div>
              <div className="text-3xl font-bold text-success">
                {teamMembers.filter((m) => m.lastActive.includes("minutes")).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Actions This Week</div>
              <div className="text-3xl font-bold">{teamMembers.reduce((sum, m) => sum + m.actionsThisWeek, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Admins</div>
              <div className="text-3xl font-bold">{teamMembers.filter((m) => m.role === "Admin").length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
