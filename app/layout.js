import './globals.css';
export const metadata = { title: 'Koshrk Rider', manifest: '/manifest.json' };
export const viewport = { themeColor: '#10151c', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
