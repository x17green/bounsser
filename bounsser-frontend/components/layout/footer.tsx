import Link from "next/link"
import { Shield } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/30">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">Bouncer</span>
            </Link>
            <p className="text-sm font-body text-muted-foreground">AI-powered social media impersonation protection</p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href={ROUTES.DEMO} className="hover:text-foreground transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRICING} className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href={ROUTES.DOCUMENTATION} className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href={ROUTES.ABOUT} className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BLOG} className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li>
                <Link href={ROUTES.PRIVACY} className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.TERMS} className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SECURITY} className="hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/40 text-center text-sm font-body text-muted-foreground">
          © 2025 Bouncer. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
