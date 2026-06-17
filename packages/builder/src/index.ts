/**
 * `@typecaast/builder` — the embeddable visual editor (source-available,
 * FSL-1.1-Apache-2.0). Import the design-system stylesheet once at your app
 * root: `import "@typecaast/ui/styles.css"`.
 */

export { Builder, type BuilderProps, type BuilderEvent } from "./Builder.js";
export { Preview } from "./Preview.js";
export { TimelinePanel } from "./TimelinePanel.js";
export { Modal } from "./Modal.js";
export { StepEditor } from "./StepEditor.js";
export {
  capabilityLint,
  isStepUnsupported,
  stepCapability,
  type LintWarning,
  type StepCapability,
  type StepSupport,
} from "./lint.js";
export {
  toJSON,
  installSnippet,
  embedSnippet,
  renderSnippet,
  skinVar,
} from "./exporting.js";
export { saveLocal, loadLocal, clearLocal } from "./persistence.js";
export * from "./store.js";
