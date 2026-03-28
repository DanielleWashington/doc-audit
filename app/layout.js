import './globals.css';

export const metadata = {
  title: 'doc-audit — Documentation Is a Decision System',
  description: 'The case against documentation that informs when it should route. By Danielle Washington.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var s=localStorage.getItem('doc-audit-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if((s??(p?'dark':'light'))==='light'){document.documentElement.setAttribute('data-theme','light');}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
