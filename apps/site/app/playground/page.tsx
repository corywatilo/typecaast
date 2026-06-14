"use client";

import { useEffect } from "react";
import { Builder } from "@typecaast/builder";
import { builtinSkins } from "@typecaast/skins";
import { billingToast } from "../../lib/configs";
import { track } from "../../lib/analytics";

export default function PlaygroundPage() {
  useEffect(() => {
    track("builder_opened");
  }, []);
  return (
    <div style={{ height: "100dvh", width: "100vw" }}>
      <Builder initialConfig={billingToast} skins={builtinSkins} theme="dark" />
    </div>
  );
}
