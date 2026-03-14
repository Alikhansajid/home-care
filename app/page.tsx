import Link from "next/link";
import {
  Home, Wrench, Calendar, DollarSign, FileText,
  Users, Star, ArrowRight, CheckCircle, Shield, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Wrench, title: "Maintenance Scheduler", desc: "Auto-generate tasks for HVAC, plumbing, roof and more. Never miss a service again.", color: "gradient-blue" },
  { icon: Calendar, title: "Smart Calendar", desc: "Visual calendar of all your upcoming maintenance tasks with smart reminders.", color: "gradient-purple" },
  { icon: DollarSign, title: "Expense Tracking", desc: "Track all home expenses by category. See yearly cost breakdowns at a glance.", color: "gradient-green" },
  { icon: FileText, title: "Document Storage", desc: "Upload warranties, invoices, manuals and receipts. All in one secure place.", color: "gradient-orange" },
  { icon: Users, title: "Technician Marketplace", desc: "Find verified plumbers, electricians, HVAC pros and more in your city.", color: "gradient-blue" },
  { icon: Star, title: "Ratings & Reviews", desc: "Find the best technicians based on real homeowner reviews and ratings.", color: "gradient-purple" },
];

const plans = [
  {
    name: "Free",
    price: 0,
    features: ["1 home", "5 appliances", "Basic maintenance tracking", "2GB document storage"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: 10,
    features: ["Unlimited homes", "Unlimited appliances", "Smart email reminders", "Priority technician booking", "50GB storage", "Advanced analytics"],
    cta: "Start Pro Trial",
    popular: true,
  },
];

const stats = [
  { label: "Active Homeowners", value: "12,000+" },
  { label: "Verified Technicians", value: "3,500+" },
  { label: "Tasks Completed", value: "89,000+" },
  { label: "Countries", value: "42" },
];

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/homeowner/dashboard"); // For brevity, redirecting all authenticated users here
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">HomeCare</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/signup"><Button size="sm">Get Started <ArrowRight className="w-3 h-3" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.06),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(124,58,237,0.04),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            🏠 The Smart Home Maintenance Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.08]">
            Manage Your Home<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              Like a Pro.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Schedule maintenance, track expenses, store documents, and hire local technicians — all from one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 h-12 gap-2 shadow-lg shadow-blue-500/25">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Browse Technicians
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {[Shield, Zap, CheckCircle].map((Icon, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-green-500" />
                <span>{["Secure & Private", "Real-time Updates", "No Contracts"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-100/30 to-transparent rounded-2xl blur-2xl scale-95" />
          <div className="relative bg-white rounded-2xl border border-border shadow-2xl overflow-hidden">
            <div className="h-10 border-b bg-muted/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-5 rounded-full bg-muted w-56 mx-auto" />
              </div>
            </div>
            <div className="flex h-80">
              {/* Sidebar preview */}
              <div className="w-48 border-r bg-white p-4 space-y-1">
                {["Dashboard", "My Homes", "Maintenance", "Calendar", "Expenses"].map((item, i) => (
                  <div key={item} className={`h-8 rounded-lg flex items-center px-3 ${i === 0 ? "bg-primary text-white" : "bg-transparent"}`}>
                    <div className={`h-2 rounded-full ${i === 0 ? "bg-white/70 w-20" : "bg-muted w-16"}`} />
                  </div>
                ))}
              </div>
              {/* Main content preview */}
              <div className="flex-1 p-6 bg-muted/20">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {["bg-blue-500", "bg-green-500", "bg-orange-500"].map((color, i) => (
                    <div key={i} className="h-20 rounded-xl bg-white border shadow-sm p-4">
                      <div className={`w-6 h-6 rounded ${color} mb-2`} />
                      <div className="h-2 bg-muted rounded w-16 mb-1" />
                      <div className="h-4 bg-foreground/10 rounded w-12" />
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-white rounded-xl border shadow-sm p-4">
                  <div className="h-3 bg-muted rounded w-32 mb-3" />
                  <div className="space-y-2">
                    {[80, 60, 45, 70].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-2 bg-primary/30 rounded-full" style={{ width: `${w}%` }} />
                        <div className="h-2 bg-muted rounded w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything for your home</h2>
            <p className="text-lg text-muted-foreground">Stop reacting to problems. Start preventing them.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="card-hover border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border-2 ${plan.popular ? "border-primary shadow-xl shadow-blue-500/10 relative" : "border-border"}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-blue text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to protect your biggest investment?</h2>
          <p className="text-xl opacity-90 mb-10">Join 12,000+ homeowners managing their homes with confidence.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-10 text-base font-semibold">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-foreground text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">HomeCare</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/marketplace" className="hover:text-white">Marketplace</Link>
            </div>
            <p className="text-sm text-white/40">© 2026 HomeCare Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
