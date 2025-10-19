import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { StatsSection } from "@/components/sections/stats-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
