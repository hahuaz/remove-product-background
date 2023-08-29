import { defineConfig, loadEnv } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  console.log("command:", command);
  console.log("mode:", mode);
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), ""),
  };

  if (!process.env.SHOPIFY_API_KEY) {
    throw new Error("SHOPIFY_API_KEY is not defined");
  }

  return {
    root: dirname(fileURLToPath(import.meta.url)),
    plugins: [react()],
    define: {
      "process.env.SHOPIFY_API_KEY": JSON.stringify(
        process.env.SHOPIFY_API_KEY
      ),
    },
    resolve: {
      preserveSymlinks: true,
    },
    server: {
      host: "localhost",
      port: 3000,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 64999,
        clientPort: 64999,
      },
      proxy: {
        // "^/(\\?.*)?$": proxyOptions,
        "^/api(/|(\\?.*)?$)": {
          target: `http://127.0.0.1:3001`,
          changeOrigin: false,
          secure: true,
          ws: false,
        },
      },
    },
  };
});
