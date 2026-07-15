/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const staticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  ...(staticExport ? { output: "export" } : {}),
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {})
};

export default nextConfig;
