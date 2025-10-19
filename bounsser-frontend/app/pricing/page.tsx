import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Check, Zap } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"

export default function PricingPage() {
  const plans = [
    {
      name: "Personal",
      price: "$29",
      description: "Perfect for individuals and influencers",
      features: [
        "1 monitored account",
        "Real-time detection",
        "Email notifications",
        "Basic analytics",
        "Community support",
        "99.2% accuracy",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      description: "For growing brands and businesses",
      features: [
        "5 monitored accounts",
        "Real-time detection",
        "Email + DM notifications",
        "Advanced analytics",
        "Priority support",
        "Team collaboration (3 members)",
        "API access",
        "Custom webhooks",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$499",
      description: "Advanced protection for organizations",
      features: [
        "Unlimited accounts",
        "Real-time detection",
        "All notification channels",
        "Comprehensive analytics",
        "24/7 priority support",
        "Unlimited team members",
        "Full API access",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

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
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4 animate-scale-in">Simple, Transparent Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">Choose Your Protection Plan</h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            All plans include our industry-leading AI detection and 14-day free trial
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up ${plan.popular ? "border-2 border-primary shadow-lg shadow-primary/20 hover:shadow-primary/30" : "hover:shadow-primary/10"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                q: "What happens after the trial?",
                a: "You'll be automatically enrolled in your chosen plan. Cancel anytime before the trial ends to avoid charges.",
              },
            ].map((faq, i) => (
              <Card
                key={i}
                className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center mt-16 p-12 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you choose the right plan for your needs
          </p>
          <Button size="lg" variant="outline" className="bg-transparent transition-all hover:scale-105">
            Contact Sales
          </Button>
        </div>
      </section>
    </div>
  )
}
