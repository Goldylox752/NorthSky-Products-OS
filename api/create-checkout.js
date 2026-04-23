import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plan } = req.body || {};

    // Map plans → Stripe Price IDs
    const prices = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      elite: process.env.STRIPE_PRICE_ELITE,
    };

    const priceId = prices[plan];

    if (!priceId) {
      return res.status(400).json({
        error: "Invalid plan",
        received: plan,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${process.env.BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/?canceled=true`,

      metadata: {
        plan,
      },
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);

    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}