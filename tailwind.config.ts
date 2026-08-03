import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F5F7",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        primary: "#AD7C24",
        secondary: "#6E4FD1",
        success: "#1C8F5C",
        error: "#D6483D",
      },
    },
  },
  plugins: [],
};
export default config;
