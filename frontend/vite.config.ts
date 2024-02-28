import { defineConfig, loadEnv } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  console.log("command:", command);
  console.log("mode:", mode);
  console.log("meta.url", import.meta.url);
  // TODO while building for production, you still need frontend/.env file. reduce it to only one .env file
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), ""),
  };

  console.log("SHOPIFY_API_KEY", process.env.SHOPIFY_API_KEY);
  if (!process.env.SHOPIFY_API_KEY) {
    throw new Error("SHOPIFY_API_KEY is not defined");
  }
  // TODO what is difference createServer root and defineConfig root
  const root = dirname(fileURLToPath(import.meta.url));
  return {
    root,
    resolve: {
      alias: {
        "@": root,
      },
    },
    plugins: [react()],
    define: {
      "process.env.SHOPIFY_API_KEY": JSON.stringify(
        process.env.SHOPIFY_API_KEY
      ),
    },
  };
});
