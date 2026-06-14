import { PostHog } from "posthog-node";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export const posthog = new PostHog(key, {
  ...(host ? { host } : {}),
  enableExceptionAutocapture: true,
});
