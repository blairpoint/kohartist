const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

// Serve static files from the 'public' folder
app.use(express.static('public'));

const YOUR_DOMAIN = 'https://kohartist.fly.dev';

// FIX: Root route handler to serve your main landing page or redirect to it
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Public/checkout.html');
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: '{{PRICE_ID}}', 
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`, // FIX: Lowercase path routing to match your public folder
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,   // Added a cancel fallback for Stripe's requirement
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error("Stripe Session Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// FIX: Dynamic port allocation for hosting environments, defaulting to 4242
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
