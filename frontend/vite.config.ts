import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem"),
    },
    proxy: {
      "/api": {
        target: "https://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
