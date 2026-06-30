// Markdown files are imported as plain strings (esbuild `text` loader; see
// tsup.config.ts). This ambient declaration types those imports for tsc.
declare module "*.md" {
  const content: string;
  export default content;
}
