import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131F24",
        border: "#37464F",
        card: "#202F36",
        cardHover: "#2A3A41",
        primary: "#58CC02",
        primaryHover: "#61E002",
        primaryBorder: "#58A700",
        secondary: "#202F36",
        secondaryBorder: "#37464F",
        secondaryHoverBorder: "#1899D6",
        secondaryText: "#1CB0F6",
        tertiary: "#1CB0F6",
        tertiaryHover: "#1899D6",
        danger: "#EA2B2B",
        dangerBorder: "#EA2B2B",
        dangerBg: "#311C20",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
