import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// IMPORTANT: replace with your Netlify site
const CLIENT_URL = "https://mellow-semifreddo-39bcda.netlify.app";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: CLIENT_URL
}));

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// checkout route
app.post("/checkout", async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: "nzd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",

      // 🔥 FIXED URLS
      success_url: `${CLIENT_URL}/success.html`,
      cancel_url: `${CLIENT_URL}`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
