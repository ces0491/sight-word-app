import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import StoryViewer from '../../components/story/StoryViewer';
import StorySharing from '../../components/story/StorySharing';

export default function StoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/stories');
    } else if (status === 'authenticated' && id) {
      fetchStory();
    }
  }, [status, router, id]);
  
  const fetchStory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stories/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Story not found');
        } else {
          setError('Error fetching story');
        }
        return;
      }
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Error loading the story');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    router.push('/stories');
  };
  
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading story...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>{story?.title || 'Story'} | Sight Word Story Generator</title>
        <meta name="description" content={`View your sight word story: ${story?.title}`} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">View Story</h1>
          </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-6">
          <StoryViewer 
            story={story} 
            onBack={handleBack} 
            showShareDialog={() => setShowShareDialog(true)} 
          />
        </main>
        
        {showShareDialog && (
          <StorySharing 
            storyId={story._id} 
            onClose={() => setShowShareDialog(false)} 
          />
        )}
      </div>
    </>
  );
}