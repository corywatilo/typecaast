---
"@typecaast/builder": patch
---

The playground preview's **Auto** color mode now follows the **page/host theme**
instead of only `prefers-color-scheme`: when the preview theme is Auto it uses
the builder's resolved chrome theme (which already reflects the page's Light /
Dark / Auto setting, falling back to the browser preference when the page is also
Auto). Explicit Light/Dark in the preview still override.
