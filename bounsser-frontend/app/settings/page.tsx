"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Shield,
  Zap,
  Mail,
  MessageSquare,
  Webhook,
  Key,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  Download,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)

  const webhooks = [
    {
      id: 1,
      name: "Slack Notifications",
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX",
      events: ["threat.detected", "account.flagged"],
      status: "active",
      lastTriggered: "2 hours ago",
    },
    {
      id: 2,
      name: "Discord Alerts",
      url: "https://discord.com/api/webhooks/123456789/abcdefghijklmnop",
      events: ["threat.detected"],
      status: "active",
      lastTriggered: "5 hours ago",
    },
  ]

  const integrations = [
    { name: "Slack", connected: true, icon: MessageSquare },
    { name: "Discord", connected: true, icon: MessageSquare },
    { name: "Email", connected: true, icon: Mail },
    { name: "Webhook", connected: true, icon: Webhook },
  ]

  return (
    <DashboardLayout mode="organization">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your organization's protection settings and integrations</p>
        </div>

        <Tabs defaultValue="protection" className="space-y-6">
          <TabsList>
            <TabsTrigger value="protection">Protection</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API & Webhooks</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Protection Settings */}
          <TabsContent value="protection" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Detection Settings</CardTitle>
                </div>
                <CardDescription>Configure how Bouncer detects and responds to threats</CardDescription>
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
                      <p className="text-sm text-muted-foreground">
                        Automatically flag accounts with confidence above 90%
                      </p>
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Follower Overlap Analysis</Label>
                      <p className="text-sm text-muted-foreground">Check for mutual followers between accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle>Automated Actions</CardTitle>
                </div>
                <CardDescription>Configure automatic responses to detected threats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Auto-DM Account Owner</Label>
                    <p className="text-sm text-muted-foreground">Send DM to target account when threat is detected</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Public Notice</Label>
                    <p className="text-sm text-muted-foreground">Post public warning about impersonation attempts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Auto-Report to Platform</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically report high-confidence threats to Bouncer moderators
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div>
                  <Label className="text-base mb-3 block">Rate Limits</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dm-limit" className="text-sm">
                        Max DMs per hour
                      </Label>
                      <Input id="dm-limit" type="number" defaultValue="10" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="report-limit" className="text-sm">
                        Max reports per day
                      </Label>
                      <Input id="report-limit" type="number" defaultValue="50" className="mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle>Notification Channels</CardTitle>
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
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <Label className="text-base">Slack Integration</Label>
                        <p className="text-sm text-muted-foreground">Send alerts to Slack workspace</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <Label className="text-base">Discord Integration</Label>
                        <p className="text-sm text-muted-foreground">Send alerts to Discord server</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
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

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Email Recipients</Label>
                    <div className="space-y-2">
                      {["admin@company.com", "security@company.com"].map((email, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <span className="text-sm">{email}</span>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>Manage third-party service connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.map((integration, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected && (
                        <Badge variant="outline" className="text-success border-success/50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        {integration.connected ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                      <p className="text-sm text-muted-foreground">@company</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Another Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Webhooks */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <CardTitle>API Keys</CardTitle>
                </div>
                <CardDescription>Manage API keys for programmatic access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base">Production API Key</Label>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value="bnc_prod_1234567890abcdefghijklmnopqrstuvwxyz"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Last used: 2 hours ago</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-primary" />
                      <CardTitle>Webhooks</CardTitle>
                    </div>
                    <CardDescription className="mt-2">Configure webhook endpoints for real-time events</CardDescription>
                  </div>
                  <Button onClick={() => setShowWebhookDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{webhook.name}</h4>
                          <Badge variant={webhook.status === "active" ? "default" : "secondary"} className="text-xs">
                            {webhook.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {webhook.events.map((event, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Last triggered: {webhook.lastTriggered}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">Enterprise Plan</h3>
                      <p className="text-muted-foreground">Advanced protection for organizations</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">$499</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accounts:</span>
                      <span className="font-medium ml-2">Unlimited</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Team Members:</span>
                      <span className="font-medium ml-2">Unlimited</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">API Calls:</span>
                      <span className="font-medium ml-2">1M/month</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Support:</span>
                      <span className="font-medium ml-2">Priority</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent text-destructive border-destructive/50">
                    Cancel Subscription
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Billing History</h4>
                  <div className="space-y-2">
                    {[
                      { date: "Jan 1, 2024", amount: "$499.00", status: "Paid" },
                      { date: "Dec 1, 2023", amount: "$499.00", status: "Paid" },
                      { date: "Nov 1, 2023", amount: "$499.00", status: "Paid" },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">{invoice.date}</span>
                          <Badge variant="outline" className="text-success border-success/50">
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{invoice.amount}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
        </div>
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Configure a new webhook endpoint to receive real-time events</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="webhook-name">Webhook Name</Label>
              <Input id="webhook-name" placeholder="My Webhook" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input id="webhook-url" placeholder="https://example.com/webhook" className="mt-2" />
            </div>
            <div>
              <Label>Events to Subscribe</Label>
              <div className="space-y-2 mt-2">
                {["threat.detected", "account.flagged", "review.completed", "report.submitted"].map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <input type="checkbox" id={event} className="w-4 h-4" />
                    <Label htmlFor={event} className="font-normal cursor-pointer">
                      {event}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowWebhookDialog(false)}>Add Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
