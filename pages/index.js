import Head from 'next/head';
import SightWordStoryGenerator from '../components/SightWordStoryGenerator';
import { SessionProvider } from 'next-auth/react';

export default function Home({ session }) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Sight Word Story Generator</title>
        <meta name="description" content="Create custom stories featuring sight words for early readers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SightWordStoryGenerator />
    </SessionProvider>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      session: null,
    },
  };
}