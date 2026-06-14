// Minimal ambient types for jest-axe — only what the a11y test uses. The
// published package ships JS without declarations and there is no
// @types/jest-axe on the registry.
declare module "jest-axe" {
  interface AxeViolation {
    id: string;
    impact?: string;
    description: string;
    help: string;
    nodes: unknown[];
  }
  interface AxeResults {
    violations: AxeViolation[];
    passes: unknown[];
  }
  interface AxeRunOptions {
    rules?: Record<string, { enabled: boolean }>;
  }
  export function axe(
    html: Element | string,
    options?: AxeRunOptions,
  ): Promise<AxeResults>;
}
