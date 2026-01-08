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
        background: '#050505', // Obsidian Black
        foreground: '#F5F5F5', // Platinum White
        primary: '#FF0033', // Neon Red (Absolute Scarcity)
        secondary: '#1A1A1A', // Dark Grey (Structure)
        accent: '#525252', // Metallic Grey
        
        // Brand Palette - Obsidian Theme
        brand: {
          obsidian: '#050505',
          red: '#FF0033',
          dark: '#0A0A0A',
          grey: '#525252',
          white: '#FFFFFF',
        },

        // Metallic Palette (Obsidian/Platinum)
        obsidian: {
          100: '#D4D4D8',
          300: '#A1A1AA',
          500: '#525252', // Main Metal
          700: '#27272A',
          900: '#09090B',
        },
        surface: '#0A0A0A', // Deep Black Surface
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
        'metallic-gold': 'linear-gradient(135deg, #63b3ed 0%, #90cdf4 50%, #3182ce 100%)',
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
