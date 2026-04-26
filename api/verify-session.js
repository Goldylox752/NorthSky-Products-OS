import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ valid: false, error: "Method not allowed" });
    }

    const { session_id } = req.body || {};

    if (!session_id) {
      return res.status(400).json({ valid: false, error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const isPaid = session.payment_status === "paid";

    return res.status(200).json({
      valid: isPaid,
      plan: session.metadata?.plan ?? null,
      userId: session.metadata?.user_id ?? null,
      customer: session.customer ?? null,
    });

  } catch (err) {
    console.error("Stripe verification error:", err);

    return res.status(500).json({
      valid: false,
      error: "Verification failed",
    });
  }
}