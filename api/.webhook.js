app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_YOUR_SECRET"
    );
  } catch (err) {
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("💰 NEW ORDER!");

    const email = session.customer_details.email;
    const product = session.metadata.product;
    const amount = session.amount_total / 100;

    // 🔥 Save to Supabase
    // await supabase.from("orders").insert({
    //   email,
    //   product,
    //   amount
    // });

    console.log({ email, product, amount });

    // 🔥 Trigger shipping / email here
  }

  res.json({ received: true });
});