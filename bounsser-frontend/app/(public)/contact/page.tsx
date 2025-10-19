import { AnimatedBackground } from "@/components/animated-background"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-center">Get in Touch</h1>
          <p className="text-xl font-body text-muted-foreground text-center mb-16">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Mail,
                title: "Email Us",
                description: "support@bouncer.app",
              },
              {
                icon: MessageSquare,
                title: "Live Chat",
                description: "Available 24/7",
              },
              {
                icon: Phone,
                title: "Call Us",
                description: "+1 (555) 123-4567",
              },
            ].map((contact, i) => (
              <div key={i} className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                  <contact.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{contact.title}</h3>
                <p className="font-body text-muted-foreground">{contact.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-body">
                    Name
                  </Label>
                  <Input id="name" placeholder="Your name" className="glass" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-body">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="glass" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-body">
                  Subject
                </Label>
                <Input id="subject" placeholder="How can we help?" className="glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="font-body">
                  Message
                </Label>
                <Textarea id="message" placeholder="Tell us more about your inquiry..." rows={6} className="glass" />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 font-body shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
