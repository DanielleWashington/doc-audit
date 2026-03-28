import './globals.css';

export const metadata = {
  title: 'doc-audit — Is Your Documentation a Decision System?',
  description: 'Audit your documentation against the Day 0/1/2 decision-system framework by Danielle Washington',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Inline script runs before body renders — prevents theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=localStorage.getItem('doc-audit-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if((s??(p?'dark':'light'))==='light'){document.documentElement.setAttribute('data-theme','light');}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
