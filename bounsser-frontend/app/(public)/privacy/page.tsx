import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Privacy Policy</h1>
          <p className="text-lg font-body text-muted-foreground mb-8">Last updated: January 10, 2025</p>

          <div className="glass-card rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Introduction</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                At Bouncer, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our social media impersonation protection service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Information We Collect</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 font-body text-muted-foreground ml-4">
                <li>Account information (name, email, password)</li>
                <li>Social media account credentials (via OAuth)</li>
                <li>Profile information from connected social media accounts</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">How We Use Your Information</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 font-body text-muted-foreground ml-4">
                <li>Provide and maintain our impersonation detection service</li>
                <li>Monitor social media platforms for potential impersonators</li>
                <li>Send you notifications about detected threats</li>
                <li>Improve and optimize our detection algorithms</li>
                <li>Communicate with you about service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Data Security</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption,
                secure data storage, and regular security audits. However, no method of transmission over the internet
                is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Your Rights</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 font-body text-muted-foreground ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">Contact Us</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at privacy@bouncer.app
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
