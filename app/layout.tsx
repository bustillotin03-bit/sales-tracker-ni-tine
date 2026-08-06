import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Christine's Sales Tracker",
  description: "Personal Xfinity Sales and Performance Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}