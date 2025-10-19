import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Play, CheckCircle, AlertTriangle } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Bouncer</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge className="mb-4 animate-scale-in">Interactive Demo</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">See Bouncer in Action</h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Watch how our AI-powered system detects and responds to impersonation attempts in real-time
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative aspect-video rounded-xl border-2 border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <Button size="lg" className="bg-primary hover:bg-primary/90 transition-all hover:scale-110">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo Video
              </Button>
            </div>
          </div>
        </div>

        {/* Detection Flow */}
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center mb-12">How Detection Works</h2>

          {/* Step 1 */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Suspicious Account Detected</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20" />
                        <div>
                          <p className="font-semibold">@YourBrand_Official</p>
                          <p className="text-sm text-muted-foreground">Legitimate Account</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground">125K followers • Verified</p>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-destructive/50 bg-destructive/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/20" />
                        <div>
                          <p className="font-semibold">@YourBrand_0fficial</p>
                          <p className="text-sm text-muted-foreground">Suspicious Account</p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-destructive ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground">234 followers • Not verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Multi-Signal Analysis</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Username Similarity", score: 92, status: "high" },
                      { label: "Profile Image Match", score: 88, status: "high" },
                      { label: "Bio Text Analysis", score: 76, status: "medium" },
                      { label: "Follower Overlap", score: 45, status: "low" },
                    ].map((signal, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-48">{signal.label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              signal.status === "high"
                                ? "bg-destructive"
                                : signal.status === "medium"
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${signal.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{signal.score}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Overall Confidence Score</span>
                      <span className="text-2xl font-bold text-destructive">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Automated Response</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { icon: CheckCircle, label: "Account Flagged", desc: "Added to review queue" },
                      { icon: CheckCircle, label: "Team Notified", desc: "Slack alert sent" },
                      { icon: CheckCircle, label: "Report Filed", desc: "Submitted to platform" },
                    ].map((action, i) => (
                      <div key={i} className="p-4 rounded-lg border border-border bg-card">
                        <action.icon className="w-8 h-8 text-success mb-3" />
                        <h4 className="font-semibold mb-1">{action.label}</h4>
                        <p className="text-sm text-muted-foreground">{action.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to protect your brand?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your free trial today and experience enterprise-grade protection
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent transition-all hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
