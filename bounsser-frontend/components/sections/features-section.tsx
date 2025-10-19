import { Shield, Lock, Zap, Users, BarChart3, Bell } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Real-time Monitoring",
      description: "Continuous scanning of mentions, replies, and hashtags across social platforms",
    },
    {
      icon: Lock,
      title: "Multi-Signal Detection",
      description: "Username similarity, profile image comparison, bio analysis, and follower overlap",
    },
    {
      icon: Zap,
      title: "Automated Response",
      description: "Instant DM alerts, public notices, and automated reporting to platform moderators",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Review queue, role-based access, and team workflows for brand protection",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track detection trends, false positive rates, and threat patterns over time",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Configurable alerts via DM, email, Slack, or webhook integrations",
    },
  ]

  return (
    <section id="features" className="container mx-auto px-4 py-20 md:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Comprehensive Protection</h2>
        <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
          Multi-layered detection system that identifies impersonators through advanced AI analysis
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 shadow-lg shadow-primary/10">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
            <p className="font-body text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
