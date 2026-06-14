import { cac } from "cac";
import { runValidate } from "./commands/validate.js";

const VERSION = "0.0.0";

const cli = cac("typecaast");

cli
  .command("validate <config>", "Validate a Typecaast config file")
  .option("--json", "Output diagnostics as JSON")
  .example("  typecaast validate billing-toast.json")
  .action((config: string, options: { json?: boolean }) => {
    process.exit(runValidate(config, { json: options.json }));
  });

cli.help();
cli.version(VERSION);

if (process.argv.slice(2).length === 0) {
  cli.outputHelp();
} else {
  cli.parse();
}
