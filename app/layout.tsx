import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Club — LPCPS | Building the Future with AI",
  description: "Premier AI/ML, Cybersecurity and research student community at LPCPS, Lucknow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            if (t === 'dark') document.documentElement.classList.add('dark');
          } catch(e) {}
        `}}/>
      </head>
      <body>{children}</body>
    </html>
  );
}
