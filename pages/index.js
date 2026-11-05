import Head from 'next/head';
import SightWordStoryGenerator from '../components/SightWordStoryGenerator';

const DESCRIPTION =
  'Turn the sight words a child is learning into a short illustrated story to read together, with read-aloud and a word hunt.';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sight Word Stories</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Sight Word Stories" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
      </Head>
      <SightWordStoryGenerator />
    </>
  );
}
