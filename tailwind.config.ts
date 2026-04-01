import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'
import forms from '@tailwindcss/forms'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        background: '#150330',
        primary: {
          DEFAULT: '#ff6a9f',
          container: '#ffade6',
        },
        secondary: {
          DEFAULT: '#5bd5fc',
        },
        tertiary: {
          DEFAULT: '#ffade6',
        },
        surface: {
          container: {
            lowest: '#0a0218',
            low: '#1e0445',
            medium: '#2a0660',
            high: '#35087a',
          }
        },
        'on-surface-variant': '#b0b0b0',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        '20': '20px',
        '40': '40px',
        '32': '32px',
      }
    },
  },

  plugins: [
    forms,
    containerQueries,
  ],
}
