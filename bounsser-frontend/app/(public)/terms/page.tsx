import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Terms of Service</h1>
          <p className="text-lg font-body text-muted-foreground mb-8">Last updated: January 10, 2025</p>

          <div className="glass-card rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Agreement to Terms</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                By accessing or using Bouncer's services, you agree to be bound by these Terms of Service. If you
                disagree with any part of these terms, you may not access our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Service Description</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                Bouncer provides AI-powered social media impersonation detection and protection services. We monitor
                connected social media accounts for potential impersonators and provide automated response capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">User Responsibilities</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 font-body text-muted-foreground ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with all applicable laws</li>
                <li>Not abuse or misuse the service</li>
                <li>Review flagged accounts before taking action</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Service Limitations</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                While we strive for high accuracy, our detection system may produce false positives or miss some
                impersonation attempts. Users are responsible for reviewing flagged accounts and making final decisions
                on actions to take.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Subscription and Billing</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription
                at any time, but refunds are not provided for partial billing periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Termination</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account for violations of these terms or for any
                reason at our discretion, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Contact</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, contact us at legal@bouncer.app
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
