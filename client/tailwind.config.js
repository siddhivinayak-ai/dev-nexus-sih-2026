/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Zinc-950
        foreground: '#fafafa', // Zinc-50
        card: '#09090b',
        'card-foreground': '#fafafa',
        popover: '#09090b',
        'popover-foreground': '#fafafa',
        primary: {
          DEFAULT: '#3b82f6', // Blue-500
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#27272a', // Zinc-800
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa', // Zinc-400
        },
        accent: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444', // Red-500
          foreground: '#fafafa',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#3b82f6',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
