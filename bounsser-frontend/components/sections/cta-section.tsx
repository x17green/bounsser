import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card/50 to-secondary/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to protect your brand?</h2>
        <p className="text-lg font-body text-muted-foreground mb-8">
          Join thousands of users and brands who trust Bouncer to keep their social media presence secure.
        </p>
        <Link href={ROUTES.SIGNUP}>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8 font-body shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
          >
            Start Free Trial
          </Button>
        </Link>
      </div>
    </section>
  )
}
