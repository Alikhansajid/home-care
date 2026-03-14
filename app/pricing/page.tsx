"use client";

import toast from "react-hot-toast";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/stripe";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    priceId: null,
    features: ["1 home", "5 appliances", "Basic maintenance tracking", "2GB document storage"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 10,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited homes",
      "Unlimited appliances",
      "Smart email reminders",
      "Priority technician booking",
      "50GB document storage",
      "Advanced expense analytics",
      "Priority support",
    ],
    cta: "Start Pro – $10/mo",
    popular: true,
  },
];

export default function PricingPage() {
  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) {
      window.location.href = "/signup";
      return;
    }
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      window.location.href = data.url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-foreground mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-muted-foreground">Start free. Upgrade anytime. No contracts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl p-8 border-2 relative ${
                plan.popular
                  ? "border-primary bg-white shadow-2xl shadow-blue-500/10"
                  : "border-border bg-white shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1.5 text-sm">✨ Most Popular</Badge>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                {plan.popular && (
                  <p className="text-sm text-muted-foreground mt-2">Billed monthly. Cancel anytime.</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? "bg-primary" : "bg-green-100"}`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-white" : "text-green-600"}`} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full h-12 text-base"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleCheckout(plan.priceId)}
              >
                {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-2">Questions about pricing?</p>
          <Link href="mailto:support@homecare.app" className="text-primary hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
