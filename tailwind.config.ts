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
        'gm-bg': '#F9FAFB',
        'gm-card': '#FFFFFF',
        'gm-text-primary': '#111827',
        'gm-text-secondary': '#6B7280',
        'gm-text-tertiary': '#9CA3AF',
        'gm-border': '#E5E7EB',
      },
      spacing: {
        'gm-card-padding': '24px',
        'gm-card-gap': '16px',
        'gm-section-gap': '40px',
      },
      borderRadius: {
        'gm-card': '12px',
      },
      fontSize: {
        'gm-greeting': '14px',
        'gm-summary-bold': '20px',
        'gm-summary-light': '16px',
        'gm-section-header': '13px',
        'gm-task': '15px',
      },
    },
  },
  plugins: [],
};
export default config;
