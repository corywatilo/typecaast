/**
 * Stripe Payment Link URLs for one-time donations.
 *
 * Each link is created in Stripe under the "Typecaast donation" product. These
 * are public, shareable checkout URLs — not secrets — so they live in code for
 * transparency. No Stripe API keys ship in the app: donations are handled
 * entirely by Stripe-hosted checkout, and each link redirects back to
 * `/donate/thanks` on success.
 *
 * These are LIVE-mode links — they take real payments. To regenerate them,
 * recreate the product, prices, and payment links in Stripe live mode (submit
 * type "donate", redirect to https://typecaast.com/donate/thanks).
 */
export interface DonatePreset {
  /** Whole-dollar amount (USD). */
  amount: number;
  /** Stripe Payment Link for this fixed amount. */
  url: string;
}

export const DONATE_PRESETS: DonatePreset[] = [
  { amount: 5, url: "https://donate.stripe.com/7sY3cuankfyR3pC8UKbAs00" },
  { amount: 15, url: "https://donate.stripe.com/14A00i7b83Q91hu1sibAs01" },
  { amount: 50, url: "https://donate.stripe.com/dRmbJ02US3Q94tGgncbAs02" },
  { amount: 100, url: "https://donate.stripe.com/bJecN41QO4UdbW89YObAs03" },
];

/** Payment Link with a customer-chosen amount (Stripe `custom_unit_amount`). */
export const DONATE_CUSTOM_URL =
  "https://donate.stripe.com/00wdR853072laS4c6WbAs04";
