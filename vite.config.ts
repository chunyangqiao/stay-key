import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";

import manifest from "./manifest.config.ts";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    zip({ outDir: "release", outFileName: `stay-key-${pkg.version}.zip` }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
