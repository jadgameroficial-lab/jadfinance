import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090909",
        surface: "#121212",
        card: "#181818",
        primary: "#FFD84D",
        secondary: "#7B61FF",
        success: "#31D67B",
        error: "#FF5B5B",
      },
    },
  },
  plugins: [],
};
export default config;
