# DocNet Frontend

React + TypeScript + Tailwind CSS frontend for DocNet.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Create `.env` in project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> In development the Vite proxy forwards `/api` → `localhost:5001`. No `VITE_API_URL` needed.

## Key Dependencies

- react-router-dom - Routing
- axios - HTTP client
- zustand - State management
- react-hook-form - Forms
- @tanstack/react-query - Data fetching
- @stripe/react-stripe-js - Stripe UI components
- @stripe/stripe-js - Stripe.js loader

## Stripe Integration

| File | Role |
|---|---|
| `src/services/api.ts` | `paymentService` methods: `createPaymentIntent`, `confirmPayment`, `getHistory`, `requestRefund` |
| `src/pages/EventDetails.tsx` | `PaymentForm` component with `CardElement`, triggered on paid events |
| `src/pages/PaymentHistory.tsx` | Displays past payments with refund support |

Publishable key is read from `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`.
The `vite-env.d.ts` file adds Vite type declarations for `import.meta.env`.

## Pages

- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/dashboard` - User dashboard
- `/events` - Events list
- `/events/:id` - Event details (incl. Stripe payment form)
- `/events/create` - Create event
- `/news` - News list
- `/news/:id` - News details
- `/galleries` - Galleries
- `/galleries/:id` - Gallery details
- `/connections` - Connections
- `/messages` - Messages
- `/profile/:id` - User profile
- `/payment` - Payment history
