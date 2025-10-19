export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Connect Your Account",
      description: "Securely link your social media accounts via OAuth. We only request necessary permissions.",
    },
    {
      step: "02",
      title: "Configure Protection",
      description: "Set monitoring rules, confidence thresholds, and notification preferences to match your needs.",
    },
    {
      step: "03",
      title: "Stay Protected",
      description: "Our AI monitors 24/7, flags suspicious accounts, and takes action based on your settings.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-card/20 border-y border-border/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto">
            Simple setup, powerful protection in three easy steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="text-6xl font-display font-bold text-primary/20 mb-4 transition-all duration-300 group-hover:text-primary/30 group-hover:scale-110">
                {step.step}
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">{step.title}</h3>
              <p className="font-body text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
