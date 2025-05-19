// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document component for global configuration
 * 
 * This file adds custom elements to all pages in the Next.js application.
 * Specifically, we're using it to properly load custom fonts across the entire site.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Comic Neue font for dyslexia-friendly reading */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" 
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}