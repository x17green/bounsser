import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, Zap, Mail, MessageSquare } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout mode="personal">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your protection preferences and notification settings</p>
        </div>

        {/* Protection Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Protection Settings</CardTitle>
            </div>
            <CardDescription>Configure how Bouncer monitors and responds to threats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Confidence Threshold</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum confidence score to flag an account as suspicious
                </p>
                <div className="space-y-2">
                  <Slider defaultValue={[75]} max={100} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative (50%)</span>
                    <span className="font-semibold text-foreground">Current: 75%</span>
                    <span>Aggressive (95%)</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Auto-Flag High Confidence Matches</Label>
                  <p className="text-sm text-muted-foreground">Automatically flag accounts with confidence above 90%</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Real-time Monitoring</Label>
                  <p className="text-sm text-muted-foreground">Continuously scan for new impersonation attempts</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Deep Image Analysis</Label>
                  <p className="text-sm text-muted-foreground">Use advanced AI for profile image comparison</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Choose how you want to be notified about threats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label className="text-base">Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">Get DMs on X for urgent threats</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label className="text-base">Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">Send alerts to Slack workspace</p>
                  </div>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base">Notification Frequency</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="instant" name="frequency" defaultChecked className="w-4 h-4" />
                    <Label htmlFor="instant" className="font-normal cursor-pointer">
                      Instant - Get notified immediately
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="hourly" name="frequency" className="w-4 h-4" />
                    <Label htmlFor="hourly" className="font-normal cursor-pointer">
                      Hourly - Digest every hour
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="daily" name="frequency" className="w-4 h-4" />
                    <Label htmlFor="daily" className="font-normal cursor-pointer">
                      Daily - Summary once per day
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">X (Twitter)</p>
                  <p className="text-sm text-muted-foreground">@johndoe</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Connect Another Account
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
