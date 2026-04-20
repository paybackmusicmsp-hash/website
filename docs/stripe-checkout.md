# Stripe Checkout for Booking Flow

## What this adds

- bookings still write to Firestore first
- each new booking is saved with `status: "pending"`
- payment begins through Stripe Checkout after the booking is created
- Stripe webhook updates the same Firestore booking record when payment completes

## Environment variables to set

Set these for the Firebase Functions runtime:

- `STRIPE_SECRET_KEY`
  - your live Stripe secret key
  - example format: `sk_live_...`

- `STRIPE_WEBHOOK_SECRET`
  - webhook signing secret from the Stripe Dashboard endpoint you create for `stripeCheckoutWebhook`
  - example format: `whsec_...`

- `STRIPE_BOOKING_DEPOSIT_CENTS`
  - integer amount charged in Checkout
  - example: `5000` for `$50.00`

- `PUBLIC_SITE_URL`
  - full public site origin used to build Checkout success/cancel URLs
  - example: `https://starmoneymsp.com`

Optional:

- `STRIPE_BOOKING_CURRENCY`
  - defaults to `usd`

## Manual Stripe Dashboard steps

1. Create or confirm your Stripe account is in live mode.
2. Decide the flat launch deposit amount you want Checkout to charge.
3. In Stripe Dashboard, create a webhook endpoint pointing to:
   - `https://us-central1-booking-8bc2d.cloudfunctions.net/stripeCheckoutWebhook`
4. Subscribe that webhook endpoint to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
5. Copy the webhook signing secret from Stripe and set it as `STRIPE_WEBHOOK_SECRET`.
6. Make sure card payments are enabled in Stripe Dashboard for your account.

## Firebase deployment

From the repo root:

1. install Firebase CLI if needed
2. deploy functions:
   - `firebase deploy --only functions`

This repo is configured for Firebase project:

- `booking-8bc2d`

## Booking record fields added by Checkout flow

These fields are added or updated on bookings:

- `paymentStatus`
  - `deposit_pending`
  - `checkout_created`
  - `paid`
- `stripeCheckoutSessionId`
- `stripeCheckoutUrl`
- `stripeCheckoutCreatedAt`
- `stripeCheckoutCompletedAt`
- `stripePaymentIntentId`
- `stripeCustomerEmail`
- `updatedAt`
