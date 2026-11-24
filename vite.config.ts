import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Mirrors the vercel.json rewrite for the confirmation portal's API.
const proxy = {
  "/api/varmistus/competition": {
    target: "https://api.tuloslista.com",
    changeOrigin: true,
    rewrite: (path: string) => path.replace("/api/varmistus", "/api/v1"),
  },
};

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // Tailscale names, for `pnpm dev:tailscale` on a phone.
  server: { proxy, allowedHosts: [".ts.net"] },
  preview: { proxy },
});
