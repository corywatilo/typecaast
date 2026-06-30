import { configJsonSchema } from "@typecaast/schema";

export const dynamic = "force-static";

// Serve the JSON Schema at its canonical $id so configs can reference it via a
// `$schema` line (editor autocomplete + a fetchable contract for LLMs). Mirrors
// the committed artifact wrapper in packages/schema/scripts/gen-json-schema.mjs.
export async function GET(): Promise<Response> {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://typecaast.com/schema/v1/typecaast.schema.json",
    title: "Typecaast config",
    ...configJsonSchema(),
  };
  return new Response(JSON.stringify(schema, null, 2) + "\n", {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
