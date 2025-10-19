export function StatsSection() {
  const stats = [
    { value: "99.2%", label: "Detection Accuracy" },
    { value: "<2min", label: "Average Response Time" },
    { value: "50K+", label: "Accounts Protected" },
    { value: "24/7", label: "Real-time Monitoring" },
  ]

  return (
    <section className="border-y border-border/40 bg-card/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2 transition-all duration-300 group-hover:scale-110">
                {stat.value}
              </div>
              <div className="text-sm font-body text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
