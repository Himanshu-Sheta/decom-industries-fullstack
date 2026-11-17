import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 35px -10px rgba(15, 23, 42, 0.08)',
        card: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
