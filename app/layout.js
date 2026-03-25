import './globals.css';

export const metadata = {
  title: 'MenuAI — Instant Menu Digitiser for Restaurants',
  description: 'Upload a photo of your physical menu and let AI extract, categorize, and digitize it in seconds. Built for restaurant owners on food delivery platforms.',
  keywords: 'menu digitiser, restaurant menu, food delivery, AI menu extraction, digital catalog',
  openGraph: {
    title: 'MenuAI — Instant Menu Digitiser',
    description: 'AI-powered menu digitisation for food delivery platforms.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
