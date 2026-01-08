import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-space)', 'Space Grotesk', 'sans-serif'], 
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'], 
      },
      colors: {
        background: '#0B1C2D', // Deep Navy Blue
        foreground: '#F5F7FA', // Soft White
        primary: '#C9A44C', // Matte Gold
        secondary: '#0E0E0E', // Charcoal Black (Stability)
        accent: '#8A8F98', // Steel Gray
        
        // Brand Palette
        brand: {
          navy: '#0B1C2D',
          gold: '#C9A44C',
          charcoal: '#0E0E0E',
          gray: '#8A8F98',
          white: '#F5F7FA',
        },

        // Metallic Palette (Adjusted for Matte Gold)
        gold: {
          100: '#F4EBC8',
          300: '#E6D391',
          500: '#C9A44C', // Main Brand Gold
          700: '#94762E',
          900: '#5E4B1D',
        },
        surface: '#0E0E0E', // Charcoal Black
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        shine: 'shine 3s linear infinite',
      },
      backgroundImage: {
        'metallic-gold': 'linear-gradient(135deg, #FBC02D 0%, #FFD700 50%, #F57F17 100%)',
        'metallic-silver': 'linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 50%, #9E9E9E 100%)',
        'glass-shine': 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 25%, transparent 30%)',
        'aurora': 'radial-gradient(1000px 400px at 20% 10%, rgba(16,185,129,0.15), transparent 60%), radial-gradient(800px 300px at 80% 0%, rgba(14,165,233,0.15), transparent 60%)',
        'sunset': 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(239,68,68,0.2))',
      }
    },
  },
  plugins: [],
};
export default config;
