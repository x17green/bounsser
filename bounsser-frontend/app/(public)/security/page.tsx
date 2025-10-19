import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-center">Security</h1>
          <p className="text-xl font-body text-muted-foreground text-center mb-16">
            Your security and privacy are our top priorities
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption",
              },
              {
                icon: Shield,
                title: "OAuth Authentication",
                description: "Secure OAuth 2.0 integration means we never store your social media passwords",
              },
              {
                icon: Eye,
                title: "Privacy by Design",
                description: "We only access the minimum data necessary to provide our protection services",
              },
              {
                icon: Server,
                title: "Secure Infrastructure",
                description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA",
              },
              {
                icon: FileCheck,
                title: "Regular Audits",
                description: "Third-party security audits and penetration testing conducted quarterly",
              },
              {
                icon: AlertTriangle,
                title: "Incident Response",
                description: "24/7 security monitoring with rapid incident response protocols",
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card glass-hover rounded-xl p-6 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                <p className="font-body text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <h2 className="text-3xl font-heading font-bold">Compliance & Certifications</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Bouncer is committed to maintaining the highest security standards and compliance with international
              regulations:
            </p>
            <ul className="grid md:grid-cols-2 gap-4">
              {["SOC 2 Type II Certified", "GDPR Compliant", "CCPA Compliant", "ISO 27001 Certified"].map((cert, i) => (
                <li key={i} className="flex items-center gap-2 font-body">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
