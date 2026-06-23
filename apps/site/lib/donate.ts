/**
 * Stripe Payment Link URLs for one-time donations.
 *
 * Each link is created in Stripe under the "Typecaast donation" product. These
 * are public, shareable checkout URLs — not secrets — so they live in code for
 * transparency. No Stripe API keys ship in the app: donations are handled
 * entirely by Stripe-hosted checkout, and each link redirects back to
 * `/donate/thanks` on success.
 *
 * ⚠️ TEST MODE — the URLs below are Stripe *test-mode* links
 * (donate.stripe.com/test_…). Before going live, recreate the product, prices,
 * and payment links in live mode and swap these URLs in a single commit.
 */
export interface DonatePreset {
  /** Whole-dollar amount (USD). */
  amount: number;
  /** Stripe Payment Link for this fixed amount. */
  url: string;
}

export const DONATE_PRESETS: DonatePreset[] = [
  { amount: 5, url: "https://donate.stripe.com/test_5kQ14m9hpbV62f44qw5c400" },
  { amount: 15, url: "https://donate.stripe.com/test_00wbJ0519cZa3j88GM5c401" },
  { amount: 50, url: "https://donate.stripe.com/test_8x26oGctB1gs6vk8GM5c402" },
  {
    amount: 100,
    url: "https://donate.stripe.com/test_aFa00i8dlbV69Hw0ag5c403",
  },
];

/** Payment Link with a customer-chosen amount (Stripe `custom_unit_amount`). */
export const DONATE_CUSTOM_URL =
  "https://donate.stripe.com/test_14AdR8bpx4sE06W0ag5c404";
