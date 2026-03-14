import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: ["1 home", "5 appliances", "Basic maintenance tracking", "2GB storage"],
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 10,
    features: [
      "Unlimited homes",
      "Unlimited appliances",
      "Advanced reminders & calendar",
      "Priority technician booking",
      "50GB storage",
      "Email reminders",
      "Expense analytics",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null,
  },
};
