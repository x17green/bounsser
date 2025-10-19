"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { ROUTES } from "@/lib/constants"

export function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/70 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-110">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Bouncer
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={ROUTES.DEMO}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Demo
          </Link>
          <Link
            href={ROUTES.PRICING}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Pricing
          </Link>
          <Link
            href={ROUTES.DOCUMENTATION}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Docs
          </Link>
          <Link
            href={ROUTES.ABOUT}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" className="font-body">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.SIGNUP}>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 font-body shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
