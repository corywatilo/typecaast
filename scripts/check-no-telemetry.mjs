// Hard rule (PLAN §27): the shipped runtime + CLI contain ZERO telemetry.
// This asserts no runtime package declares an analytics/phone-home SDK as a
// dependency or peerDependency. (Analytics lives only on the hosted site.)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const RUNTIME = [
  "core",
  "schema",
  "react",
  "remotion",
  "skins",
  "skin-kit",
  "cli",
];

const BANNED = [
  "posthog-js",
  "posthog-node",
  "posthog",
  "amplitude-js",
  "@amplitude/analytics-browser",
  "@amplitude/analytics-node",
  "mixpanel-browser",
  "mixpanel",
  "@segment/analytics-next",
  "analytics",
  "@vercel/analytics",
  "@sentry/browser",
  "@sentry/node",
];

const errors = [];
for (const pkg of RUNTIME) {
  const pj = JSON.parse(
    readFileSync(join(root, "packages", pkg, "package.json"), "utf8"),
  );
  for (const field of ["dependencies", "peerDependencies"]) {
    for (const dep of Object.keys(pj[field] ?? {})) {
      if (BANNED.includes(dep)) {
        errors.push(`@typecaast/${pkg} declares analytics SDK "${dep}" (${field})`);
      }
    }
  }
}

if (errors.length) {
  console.error("✖ telemetry guard failed:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ zero telemetry in ${RUNTIME.length} runtime packages`);
