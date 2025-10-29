import { createThemes } from "tw-colors";

/*
  Plugin tw-colors sẽ tạo ra 2 bộ biến CSS ứng với theme light và dark.
  Mỗi key (white, black, grey, …) sẽ trở thành CSS variable.
  Khi bạn set theme bằng data-theme="light" hoặc data-theme="dark", plugin sẽ thay đổi giá trị các biến đó.

*/

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      sm: "12px",
      base: "14px",
      xl: "16px",
      "2xl": "20px",
      "3xl": "28px",
      "4xl": "38px",
      "5xl": "50px",
    },
    extend: {
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
      },
    },
  },
  plugins: [
    createThemes({
      light: {
        white: "#FFFFFF",
        black: "#242424",
        grey: "#F3F3F3",
        "dark-grey": "#6B6B6B",
        lavender: "#e6e6fa",
        "pink-pastel": "#FFDCE3",
        facebook: "#1877F2",
        red: "#FF4E4E",
        transparent: "transparent",
        twitter: "#1DA1F2",
        purple: "#8B46FF",
      },
      dark: {
        white: "#242424",
        black: "#F3F3F3",
        grey: "#2A2A2A",
        "dark-grey": "#E7E7E7",
        lavender: "#e6e6fa",
        "pink-pastel": "#FFDCE3",
        facebook: "#1877F2",
        red: "#991F1F",
        transparent: "transparent",
        twitter: "#0E71A8",
        purple: "#582C8E",
      },
    }),
  ],
};