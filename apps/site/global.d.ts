// Markdown files import as raw strings (webpack `asset/source`; see
// next.config.mjs). This types those imports for tsc.
declare module "*.md" {
  const content: string;
  export default content;
}
