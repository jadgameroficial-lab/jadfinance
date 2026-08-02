/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Não há eslint/eslint-config-next instalado nem arquivo de config no projeto.
    // Sem isso, "next build" pode falhar na etapa de lint em ambientes não-interativos (Vercel).
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
