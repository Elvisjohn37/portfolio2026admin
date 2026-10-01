import type { NextConfig } from "next"
import { PORTFOLIO_URL } from "./lib/portfolio-url"

/**
 * Where the public portfolio (which owns `public/projects/*` media) is served.
 * Project thumbnails in the DB are stored as root-relative paths
 * (`/projects/…`) and resolved by the portfolio site, so the admin proxies
 * them through instead of duplicating the files.
 */

const nextConfig: NextConfig = {
    reactStrictMode: false,
    // The admin panel talks to the API through its own route handlers
    // (httpOnly cookie → Authorization header), so no CORS setup is needed.
    poweredByHeader: false,
    async rewrites() {
        return [
            {
                // e.g. /projects/elgada1.png → http://localhost:3000/projects/elgada1.png
                source: "/projects/:path*",
                destination: `${PORTFOLIO_URL}/projects/:path*`,
            },
        ]
    },
}

export default nextConfig
