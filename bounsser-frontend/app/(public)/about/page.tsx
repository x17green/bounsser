import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Shield, Users, Target, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-center">About Bouncer</h1>
          <p className="text-xl font-body text-muted-foreground text-center mb-16">
            Protecting brands and individuals from social media impersonation through AI-powered detection
          </p>

          <div className="glass-card rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Our Mission</h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-4">
              In an era where social media presence is crucial for personal and brand identity, impersonation attacks
              have become a serious threat. Bouncer was created to combat this growing problem with cutting-edge AI
              technology that detects and prevents impersonation before it causes damage.
            </p>
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              We believe everyone deserves to have their online identity protected. Our mission is to make social media
              safer by providing accessible, powerful tools that keep impersonators at bay.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Shield,
                title: "Security First",
                description: "Built with enterprise-grade security and privacy standards",
              },
              {
                icon: Users,
                title: "User-Centric",
                description: "Designed for both individuals and organizations of all sizes",
              },
              {
                icon: Target,
                title: "Precision Detection",
                description: "99.2% accuracy in identifying impersonation attempts",
              },
              {
                icon: Zap,
                title: "Real-Time Response",
                description: "Automated actions within minutes of detection",
              },
            ].map((value, i) => (
              <div key={i} className="glass-card glass-hover rounded-xl p-6 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{value.title}</h3>
                <p className="font-body text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-3xl font-heading font-bold mb-4">Our Story</h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-4">
              Bouncer was founded in 2024 by a team of security researchers and AI engineers who witnessed firsthand the
              devastating effects of social media impersonation. From financial scams to reputation damage, the impact
              on victims was severe and often irreversible.
            </p>
            <p className="font-body text-muted-foreground text-lg leading-relaxed">
              Today, we protect over 50,000 accounts worldwide, from individual creators to Fortune 500 brands. Our
              platform has prevented millions of dollars in potential fraud and protected countless reputations from
              malicious impersonators.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
