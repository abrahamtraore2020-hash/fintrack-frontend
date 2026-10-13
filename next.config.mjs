/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pages dynamiques jamais resservies depuis le cache du navigateur : une modification enregistrée est visible tout de suite.
  experimental: {
    staleTimes: { dynamic: 0 },
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CINETPAY_APIKEY: process.env.NEXT_PUBLIC_CINETPAY_APIKEY,
    NEXT_PUBLIC_CINETPAY_SITE_ID: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
  },
}

export default nextConfig
