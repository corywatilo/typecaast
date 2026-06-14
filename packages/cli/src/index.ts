import { cac } from "cac";
import { runValidate } from "./commands/validate.js";
import { runRender, type RenderOptions } from "./commands/render.js";
import {
  runScaffoldSkin,
  type ScaffoldOptions,
} from "./commands/scaffold-skin.js";

const VERSION = "0.0.0";

const cli = cac("typecaast");

cli
  .command("validate <config>", "Validate a Typecaast config file")
  .option("--json", "Output diagnostics as JSON")
  .example("  typecaast validate billing-toast.json")
  .action((config: string, options: { json?: boolean }) => {
    process.exit(runValidate(config, { json: options.json }));
  });

cli
  .command("render <config>", "Render a config to video (mp4/gif/webm)")
  .option("-o, --out <path>", "Output file path")
  .option("--format <format>", "mp4 | gif | webm", { default: "mp4" })
  .option("--size <WxH>", "Explicit output size, e.g. 1080x1920")
  .option("--aspect <preset>", "16:9 | 1:1 | 9:16 | 4:5")
  .option("--scale <n>", "Retina scale factor (1/2/3)", { default: 1 })
  .option("--theme <theme>", "light | dark", { default: "light" })
  .option("--transparent", "Transparent background (webm)")
  .example("  typecaast render billing-toast.json --size 1080x1920 --scale 2")
  .action(async (config: string, options: RenderOptions) => {
    process.exit(await runRender(config, options));
  });

cli
  .command(
    "scaffold-skin <draft>",
    "Turn a capture SkinDraft into a template skin package",
  )
  .option("-o, --out <dir>", "Output directory (default: skins/<id>)")
  .option("--name <name>", "Skin name (default: from the draft)")
  .example("  typecaast scaffold-skin draft.json --name 'Slack-style'")
  .action((draft: string, options: ScaffoldOptions) => {
    process.exit(runScaffoldSkin(draft, options));
  });

cli.help();
cli.version(VERSION);

if (process.argv.slice(2).length === 0) {
  cli.outputHelp();
} else {
  cli.parse();
}
