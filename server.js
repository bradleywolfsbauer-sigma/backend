const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// your real site
const YOUR_DOMAIN = "https://mellow-semifreddo-39bcda.netlify.app";

app.post("/checkout", async (req, res) => {
  try {
    const items = req.body.items;

    const line_items = items.map(item => ({
      price_data: {
        currency: "nzd",
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100
      },
      quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}`
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
