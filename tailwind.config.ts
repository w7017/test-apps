import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'body': ['Inter', 'sans-serif'],
        'headline': ['Inter', 'sans-serif'],
        'code': ['monospace'],
      },
      colors: {
        'navy-blue': '#000080',
        'dark-orange': '#FF8C00',
        // Pastel Purple Color Palette
        'electric-purple': '#646CFF',
        'bright-purple': '#8B5CF6',
        'soft-purple': '#A78BFA',
        'pastel-purple': '#C4B5FD',
        'light-purple': '#DDD6FE',
        'soft-mint': '#6EE7B7',
        'soft-pink': '#F9A8D4',
        'soft-blue': '#93C5FD',
        'cream': '#FEF7ED',
        // Legacy DiagIA colors (restored to pastel)
        'diagia-primary': '#A78BFA',
        'diagia-primary-light': '#C4B5FD',
        'diagia-bg': '#F8FAFC',
        'diagia-orange': '#F97316',
        'diagia-orange-light': '#FFF7ED',
        'diagia-success': '#10B981',
        'diagia-success-light': '#ECFDF5',
        'diagia-blue': '#3B82F6',
        'diagia-blue-light': '#EFF6FF',
        'diagia-red': '#EF4444',
        'diagia-red-light': '#FEF2F2',
        'diagia-text': '#334155',
        'diagia-text-secondary': '#64748B',
        'diagia-border': '#E2E8F0',
        'diagia-ai-bg': '#F1F5F9',
        // Pastel sidebar styling
        'diagia-sidebar-gradient': 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(124, 58, 237, 0.08) 100%)',
        'diagia-sidebar-hover': '#A78BFA',
        'diagia-sidebar-header': '#F3F4F6',
        'diagia-ai-chip': '#F3F4F6',
        'diagia-ai-chip-hover': '#E5E7EB',
        // System colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        'pastel': '0.75rem',
        'soft': '1rem',
        'card': '1.25rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'pastel': '0 4px 20px rgba(168, 85, 247, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'glow-soft': '0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.08)',
        'card-soft': '0 2px 10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'hover-soft': '0 8px 25px rgba(168, 85, 247, 0.2), 0 4px 12px rgba(168, 85, 247, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'gentle-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'soft-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.25)' },
        },
        'gradient-shift-soft': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
        'soft-glow': 'soft-glow 3s ease-in-out infinite',
        'gradient-shift-soft': 'gradient-shift-soft 4s ease infinite',
      },
      backdropBlur: {
        'soft': '8px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
