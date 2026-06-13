# Licensing

Typecaast is **open-core**. Different parts of the repository carry different licenses, chosen to maximize adoption of the runtime while protecting the differentiated product surface. **Never describe the project as a whole as "open source"** — the runtime is open source; the builder is source-available.

Consistent wording, everywhere: **"Runtime: Apache-2.0 (open source). Builder: FSL-1.1-Apache-2.0 (source-available)."**

## Tiers

| Tier                | Packages                                                                                | License                                                | Why                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime / SDK**   | `@typecaast/core`, `schema`, `react`, `remotion`, `skins`, `skin-kit`, `cli`, `capture` | **Apache-2.0** (true OSS, OSI-approved)                | These are imported/embedded and are the basis for community skins. Adoption > protection; Apache adds a patent grant over MIT.                                 |
| **Product surface** | `@typecaast/builder`, `apps/site`                                                       | **FSL-1.1-Apache-2.0** (source-available, non-compete) | The differentiated UX. Free to use, self-host, and modify — **not** to launch a competing generator. Auto-converts to Apache-2.0 two years after each release. |
| **Commercial**      | `typecaast-cloud` render service                                                        | **Proprietary / private**                              | Never published in this repo; the paid layer.                                                                                                                  |

Each package carries its own `LICENSE` file matching its tier. The root [`LICENSE`](./LICENSE) is Apache-2.0 (the default for the runtime).

## What "competing" means

You **may** build products and content _with_ Typecaast. You **may not** offer Typecaast-the-generator or a Typecaast render service as a competing product or service. A competitor can fork the Apache-licensed runtime — that is intentional; the moat is the builder UX, capture tooling, the hosted service, and the brand, not the rendering primitives. The full definition lives in the FSL [`LICENSE`](./licenses/FSL-1.1-Apache-2.0.md) text.

## Contributions

- Contributions to **FSL-licensed** packages (`builder`, `apps/site`) require a lightweight **CLA** (inbound = outbound) so the project retains the relicensing rights needed for the eventual Apache-2.0 conversion.
- Contributions to **Apache-tier** packages may come in under a DCO.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Trademark ≠ license

The Typecaast **name and logo** are protected regardless of code license. A fork may use the code under its tier's terms but not the Typecaast brand. See [`TRADEMARKS.md`](./TRADEMARKS.md).

---

_Not legal advice. The FSL instrument and trade-dress posture are reviewed by a lawyer before public launch._
