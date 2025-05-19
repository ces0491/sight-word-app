import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import StoryViewer from '../../components/story/StoryViewer';

export default function SharedStoryPage() {
  const router = useRouter();
  const { id, token } = router.query;
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id && token) {
      fetchSharedStory();
    }
  }, [id, token, fetchSharedStory]);
  
  const fetchSharedStory =  useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shared-stories/${id}?token=${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Story not found');
        } else if (response.status === 401) {
          setError('Unauthorized access');
        } else {
          setError('Error loading the story');
        }
        return;
      }
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching shared story:', error);
      setError('Error loading the story');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);
  
  const handleBack = () => {
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading shared story...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">This link may have expired or the story is no longer available.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{story?.title || 'Shared Story'} | Sight Word Story Generator</title>
        <meta name="description" content={`View a shared sight word story: ${story?.title}`} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Shared Story</h1>
          </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-6">
          <StoryViewer 
            story={story} 
            onBack={handleBack}
            isSharedView={true}
          />
        </main>
        
        <footer className="bg-gray-100 border-t py-4">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2025 Sight Word Story Generator • An educational tool for teachers and students</p>
          </div>
        </footer>
      </div>
    </>
  );
}