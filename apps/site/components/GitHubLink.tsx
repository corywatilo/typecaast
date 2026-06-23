import { GitHubIcon } from "./icons";

const REPO_URL = "https://github.com/corywatilo/typecaast";

/**
 * Icon-only link to the GitHub repo — the social-icon counterpart to `XFollow`,
 * sitting beside it in the header. (The `GitHubStar` button is the primary
 * star/repo CTA; this is the compact mark for the social cluster.)
 */
export function GitHubLink({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      className={`tc-btn tc-btn--ghost tc-btn--${size}`}
      aria-label="Typecaast on GitHub"
      title="Typecaast on GitHub"
    >
      <GitHubIcon />
    </a>
  );
}
