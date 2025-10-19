import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const posts = [
    {
      title: "Understanding Social Media Impersonation: A Growing Threat",
      excerpt:
        "Learn about the different types of impersonation attacks and how they can impact your brand or personal reputation.",
      date: "2025-01-15",
      readTime: "5 min read",
      category: "Security",
    },
    {
      title: "How AI Detects Impersonators: Behind the Technology",
      excerpt:
        "A deep dive into the machine learning algorithms and detection signals that power Bouncer's protection system.",
      date: "2025-01-10",
      readTime: "8 min read",
      category: "Technology",
    },
    {
      title: "Best Practices for Social Media Account Security",
      excerpt:
        "Essential tips and strategies to protect your social media accounts from unauthorized access and impersonation.",
      date: "2025-01-05",
      readTime: "6 min read",
      category: "Best Practices",
    },
    {
      title: "Case Study: How Brand X Prevented a Major Impersonation Attack",
      excerpt:
        "Real-world example of how early detection and automated response saved a major brand from reputation damage.",
      date: "2024-12-28",
      readTime: "7 min read",
      category: "Case Study",
    },
    {
      title: "The Cost of Impersonation: Financial and Reputational Impact",
      excerpt:
        "Analysis of the real costs associated with social media impersonation attacks and why prevention is crucial.",
      date: "2024-12-20",
      readTime: "5 min read",
      category: "Analysis",
    },
    {
      title: "New Feature: Team Collaboration for Enterprise Protection",
      excerpt:
        "Introducing our new team management features designed for organizations protecting multiple brand accounts.",
      date: "2024-12-15",
      readTime: "4 min read",
      category: "Product Updates",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-center">Blog</h1>
          <p className="text-xl font-body text-muted-foreground text-center mb-16">
            Insights, updates, and best practices for social media security
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <article
                key={i}
                className="glass-card glass-hover rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium mb-4">
                  {post.category}
                </div>
                <h2 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="font-body text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm font-body text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="group-hover:text-primary transition-colors p-0">
                  Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
