import { defineConfig, loadEnv } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  console.log("command:", command);
  console.log("mode:", mode);
  console.log("meta.url", import.meta.url);

  const filePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(filePath);
  const parentDir = dirname(currentDir);

  // go up one level to work with .env file from root
  process.env = {
    ...process.env,
    ...loadEnv(mode, parentDir, ""),
  };
  if (!process.env.SHOPIFY_APP_ID) {
    throw new Error("SHOPIFY_APP_ID is not defined");
  }

  return {
    root: currentDir,
    resolve: {
      alias: {
        "@": currentDir,
      },
    },
    plugins: [react()],
    define: {
      // expose env variables to the client
      "process.env.SHOPIFY_APP_ID": JSON.stringify(process.env.SHOPIFY_APP_ID),
    },
  };
});
