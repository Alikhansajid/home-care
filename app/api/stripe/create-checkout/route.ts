import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceId } = await req.json();

    const profile = (await db.select({ stripe_customer_id: profiles.stripe_customer_id, email: profiles.email }).from(profiles).where(eq(profiles.id, userId)))[0];

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.primaryEmailAddress?.emailAddress || "",
        metadata: { clerk_user_id: userId },
      });
      customerId = customer.id;

      await db.update(profiles).set({ stripe_customer_id: customerId }).where(eq(profiles.id, userId));
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/homeowner/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { clerk_user_id: userId },
    });

    return NextResponse.json({ url: session?.url || "#" });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
