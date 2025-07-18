// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/*
  defineConfig: giúp Vite có IntelliSense và xác thực cấu hình.
  @vitejs/plugin-react: plugin cần thiết để hỗ trợ JSX, Fast Refresh, v.v.
  path.resolve(__dirname, './src'): tạo alias '@' trỏ đến thư mục src.
*/

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
