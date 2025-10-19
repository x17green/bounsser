import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-body text-primary mb-6 animate-scale-in backdrop-blur-sm">
          <Zap className="w-4 h-4" />
          <span>AI-Powered Protection</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-balance animate-fade-in-up bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
          Stop impersonation attacks before they damage your brand
        </h1>
        <p
          className="text-lg md:text-xl font-body text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Real-time detection and automated response to protect your social media presence from impersonators, scammers,
          and fraudulent accounts.
        </p>
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link href={ROUTES.SIGNUP}>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 font-body shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
            >
              Protect My Account
            </Button>
          </Link>
          <Link href={ROUTES.DEMO}>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 font-body bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 transition-all hover:scale-105"
            >
              Watch Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
