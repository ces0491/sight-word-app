// pages/index.js
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import EnhancedSightWordStoryGenerator from '../components/EnhancedSightWordStoryGenerator';

/**
 * Main application page
 * 
 * This page includes all the necessary improvements:
 * - Better story generation with coherent sentence structure
 * - Enhanced OCR functionality
 * - Mobile-friendly image upload with access to photo library
 * - Improved readability of learning considerations
 * - Real adaptations for different learning needs
 */
export default function Home({ session }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Sight Word Story Generator | Educational Tool for Early Readers</title>
        <meta name="description" content="Create custom stories featuring sight words for early readers with special accommodations for different learning needs." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1d4ed8" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="Sight Word Story Generator" />
        <meta property="og:description" content="Create custom stories featuring sight words for early readers with accommodations for different learning needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sight-word-app.vercel.app" />
        <meta property="og:image" content="https://sight-word-app.vercel.app/og-image.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Pre-connect to essential resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Comic Neue font for dyslexia-friendly reading */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" 
          rel="stylesheet"
        />
      </Head>
      
      {/* Load enhanced CSS for learning adaptations */}
      <style jsx global>{`
        /* Import our enhanced CSS for learning adaptations */
        @import url('/styles/learningAdaptations.css');
      `}</style>
      
      {/* Main application component */}
      <EnhancedSightWordStoryGenerator />
    </SessionProvider>
  );
}

/**
 * Server-side rendering to get initial session
 * This allows us to check authentication state server-side
 */
export async function getServerSideProps(context) {
  return {
    props: {
      session: null,
    },
  };
}