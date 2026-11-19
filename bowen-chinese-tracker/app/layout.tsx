import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Bowen's Chinese Tracker",
  description: 'A family vocabulary and lesson tracker for learning Mandarin.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
