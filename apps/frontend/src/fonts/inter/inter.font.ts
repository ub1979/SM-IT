import { Inter, JetBrains_Mono } from 'next/font/google';

// next/font only accepts values written out in place here, not shared variables
export const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'greek', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'greek', 'vietnamese'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
