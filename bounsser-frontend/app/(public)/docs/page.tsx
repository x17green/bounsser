import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Book, Code, Zap, Shield, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const sections = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Quick start guide to set up your account and connect social media platforms",
      links: ["Installation", "Authentication", "First Steps"],
    },
    {
      icon: Shield,
      title: "Detection System",
      description: "Learn how our AI-powered detection system identifies impersonators",
      links: ["Detection Signals", "Confidence Scores", "Review Queue"],
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Configure monitoring rules, thresholds, and notification preferences",
      links: ["Stream Rules", "Thresholds", "Notifications"],
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation for integrating Bouncer into your workflow",
      links: ["Authentication", "Endpoints", "Webhooks"],
    },
    {
      icon: Zap,
      title: "Integrations",
      description: "Connect Bouncer with Slack, email, and other tools",
      links: ["Slack", "Email", "Custom Webhooks"],
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Understanding your protection metrics and threat patterns",
      links: ["Dashboard", "Reports", "Exports"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-center">Documentation</h1>
          <p className="text-xl font-body text-muted-foreground text-center mb-16">
            Everything you need to know about using Bouncer
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, i) => (
              <div key={i} className="glass-card glass-hover rounded-xl p-6 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{section.title}</h3>
                <p className="font-body text-muted-foreground mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm font-body text-primary hover:underline flex items-center gap-1">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
