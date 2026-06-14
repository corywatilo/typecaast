/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We lint with the repo's flat ESLint config separately.
  eslint: { ignoreDuringBuilds: true },
  // Workspace packages ship compiled dist; transpile the FSL UI/builder anyway
  // so their JSX/CSS resolve cleanly in the Next build.
  transpilePackages: [
    "@typecaast/ui",
    "@typecaast/builder",
    "@typecaast/react",
    "@typecaast/skins",
    "@typecaast/skin-kit",
  ],
};

export default nextConfig;
