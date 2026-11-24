import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      alias: { "~/*": "./src/*" },
    }),
  ],
  // Tailscale names, for `pnpm dev:tailscale` on a phone.
  server: { allowedHosts: [".ts.net"] },
});
