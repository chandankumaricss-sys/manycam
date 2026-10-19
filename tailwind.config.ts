import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#182230",
        primary: {
          DEFAULT: "#0796E5",
          deep: "#0878BF",
          muted: "#EFF8FF",
          light: "#E0F2FE",
        },
        cyan: {
          brand: "#22B8F0",
        },
        border: {
          light: "#E7ECF2",
          DEFAULT: "#E7ECF2",
        },
        text: {
          primary: "#182230",
          secondary: "#667085",
          muted: "#98A2B3",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#0796E5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        md: "0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        lg: "0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
        card: "0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
