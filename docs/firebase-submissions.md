# Firebase Submission Flow

## Current architecture

This site does **not** use a custom API route for public form submissions.

The live submission flow is:

1. page-specific HTML loads Firebase client scripts from Google CDN
2. `assets/site.js` calls `MSPSite.initFirebase()`
3. `assets/site.js` initializes the client app with the shared `firebaseConfig`
4. the page script calls `firebase.firestore()`
5. the form writes directly to a Firestore collection

## Shared Firebase config location

The shared client config lives in:

- `assets/site.js`

Current keys in use:

- `apiKey`
- `authDomain`
- `projectId`

## Environment variables

There are currently **no repo-managed environment variable files** for the public client Firebase config.

The production site uses the in-repo client config in `assets/site.js`.

If this changes later, update this document and move the values into the chosen deployment environment.

## Collections currently used by the site

- `bookings`
  - booking flow
  - client dashboard
  - admin dashboard

- `applications`
  - join form
  - work with us intake
  - admin dashboard

- `users`
  - client/admin auth profile records

## Work With Us intake

`work-with-us.html` now writes into the existing `applications` collection instead of a one-off collection.

This keeps the intake aligned with the current project architecture because:

- the site already uses `applications` for non-booking submissions
- the admin dashboard already reads `applications`
- no new backend or separate submission stack is required

`Work With Us` submissions include:

- `type: "work_with_us"`
- standard application fields used elsewhere:
  - `name`
  - `email`
  - `role`
  - `link`
  - `bio`
  - `status`
- structured intake fields:
  - `reachOutAs`
  - `location`
  - `primaryLink`
  - `supportFocus`
  - `goals`
  - `stage`
  - `whyMsp`
  - `recentWork`
  - `audience`
  - `budget`
  - `extraContext`
  - `submittedAt`
  - `createdAt`
  - `created`

## Failure behavior

If Firebase or Firestore fails to initialize on the page:

- the submit button is disabled
- the page shows a visible error banner
- the form does not pretend submission is available

If Firestore rejects the write:

- the page shows the real error message when available
- otherwise it falls back to a generic retry message

## Temporary booking payment flow

The current launch-safe payment setup keeps Firebase as the source of truth:

1. `book.html` writes a pending booking into `bookings`
2. after the Firestore write succeeds, the user is redirected to a hosted Stripe Payment Link

There is no custom payment backend in the current temporary setup.
