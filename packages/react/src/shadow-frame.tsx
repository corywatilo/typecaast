import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * Base reset injected inside the shadow root. The host page's stylesheet
 * selectors (`*`, `code {}`, `.prose p {}`, …) cannot reach into a shadow tree,
 * so the only thing that leaks in is **inherited** properties from the host
 * element. `all: initial` on `:host` neutralises those (line-height, font-weight,
 * letter-spacing, font-variant, font-family, color) to clean defaults; the
 * skin's `Frame` then sets its own font/colour as usual. The universal
 * `box-sizing: border-box` matches the baseline the skins are authored against.
 */
const RESET = `
:host { all: initial; display: block; width: 100%; height: 100%; }
*, *::before, *::after { box-sizing: border-box; }
`;

/**
 * Renders its children inside an **open shadow root**, so an embedded
 * `<Typecaast>` is immune to the host page's global CSS (resets, Tailwind
 * `.prose`, tag rules, inherited `line-height`/font). Used by `<Typecaast>` when
 * `isolate` is set.
 *
 * Client-only by nature — `attachShadow` needs the DOM, so on the server (and
 * the first client render) nothing is portaled; the light-DOM host div still
 * reserves the widget's size, and the visuals hydrate in. The web fonts the
 * skins register via the `FontFace` API live in the document and apply across
 * the shadow boundary, so typography is unaffected.
 */
export function ShadowFrame({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // `?? shadowRoot` makes this safe under StrictMode's double-invoke (a second
    // attachShadow would throw).
    setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" style={style}>
      {root
        ? createPortal(
            <>
              <style>{RESET}</style>
              {children}
            </>,
            root,
          )
        : null}
    </div>
  );
}
