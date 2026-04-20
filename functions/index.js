const admin = require("firebase-admin");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const Stripe = require("stripe");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function normalizeBaseUrl(origin) {
  const configuredUrl = process.env.PUBLIC_SITE_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }
  if (!origin) return getRequiredEnv("PUBLIC_SITE_URL");
  return origin.replace(/\/+$/, "");
}

exports.createStripeCheckoutSession = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to continue to payment.");
  }

  const bookingId = String(request.data?.bookingId || "").trim();
  const origin = String(request.data?.origin || "").trim();
  if (!bookingId) {
    throw new HttpsError("invalid-argument", "Missing bookingId.");
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found.");
  }

  const booking = bookingSnap.data() || {};
  if (booking.ownerUid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "You can only pay for your own booking.");
  }

  if (booking.paymentStatus === "paid") {
    throw new HttpsError("failed-precondition", "This booking is already marked paid.");
  }

  const stripe = getStripe();
  const siteUrl = normalizeBaseUrl(origin);
  const depositCents = Number.parseInt(getRequiredEnv("STRIPE_BOOKING_DEPOSIT_CENTS"), 10);
  if (!Number.isFinite(depositCents) || depositCents < 50) {
    throw new Error("Invalid STRIPE_BOOKING_DEPOSIT_CENTS");
  }

  const currency = (process.env.STRIPE_BOOKING_CURRENCY || "usd").toLowerCase();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/pay.html?id=${encodeURIComponent(bookingId)}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pay.html?id=${encodeURIComponent(bookingId)}&checkout=cancel`,
    customer_email: booking.email || request.auth.token.email || undefined,
    payment_method_types: ["card"],
    metadata: {
      bookingId,
      ownerUid: request.auth.uid,
      service: booking.service || ""
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: depositCents,
          product_data: {
            name: "MSP 790 Booking Deposit",
            description: booking.service
              ? `${booking.service} booking deposit for MSP 790 Payback Music`
              : "Booking deposit for MSP 790 Payback Music"
          }
        }
      }
    ]
  });

  await bookingRef.update({
    paymentStatus: "checkout_created",
    stripeCheckoutSessionId: session.id,
    stripeCheckoutUrl: session.url || "",
    stripeCheckoutCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    url: session.url,
    sessionId: session.id
  };
});

exports.stripeCheckoutWebhook = onRequest({ region: "us-central1" }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  let event;
  try {
    const stripe = getStripe();
    const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (error) {
    logger.error("Stripe webhook signature verification failed", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await db.collection("bookings").doc(bookingId).set(
          {
            paymentStatus: "paid",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent || "",
            stripeCustomerEmail: session.customer_details?.email || session.customer_email || "",
            stripeCheckoutCompletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await db.collection("bookings").doc(bookingId).set(
          {
            paymentStatus: "deposit_pending",
            stripeCheckoutSessionId: session.id,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook processing failed", error);
    res.status(500).send("Webhook processing failed");
  }
});
