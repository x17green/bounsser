import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Check } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "High Confidence Impersonation Detected",
      message: "Account @john_d0e shows 92% similarity to your profile",
      timestamp: "2 hours ago",
      read: false,
      action: "Review Now",
    },
    {
      id: 2,
      type: "success",
      title: "Account Successfully Reported",
      message: "Your report for @johndoe_fake has been submitted to platform moderators",
      timestamp: "5 hours ago",
      read: false,
      action: null,
    },
    {
      id: 3,
      type: "info",
      title: "Weekly Protection Summary",
      message: "12 threats detected and 8 accounts flagged this week",
      timestamp: "1 day ago",
      read: true,
      action: "View Report",
    },
    {
      id: 4,
      type: "alert",
      title: "New Impersonation Attempt",
      message: "Account @j0hndoe is using a similar profile image",
      timestamp: "1 day ago",
      read: true,
      action: "Review Now",
    },
    {
      id: 5,
      type: "info",
      title: "Protection Settings Updated",
      message: "Your confidence threshold has been adjusted to 75%",
      timestamp: "2 days ago",
      read: true,
      action: null,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-warning" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "info":
        return <Info className="w-5 h-5 text-primary" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  return (
    <DashboardLayout mode="personal">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on impersonation alerts and system events</p>
          </div>
          <Button variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        </div>

        {/* Unread Count */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  You have {notifications.filter((n) => !n.read).length} unread notifications
                </p>
                <p className="text-sm text-muted-foreground">Review important alerts and updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold mb-1">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {notification.timestamp}
                      </div>
                      {notification.action && (
                        <Button variant="ghost" size="sm">
                          {notification.action}
                        </Button>
                      )}
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
