import Stripe from "stripe";

const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    // Return a dummy object during build to prevent crashes
    return {
      customers: { create: async () => ({ id: "dummy" }) },
      checkout: { sessions: async () => ({ url: "#" }) },
    } as any;
  }
  return new Stripe(apiKey, {
    apiVersion: "2026-02-25.clover",
  });
};

export const stripe = getStripe();

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
