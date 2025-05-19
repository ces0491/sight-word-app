import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import StoryEditor from '../../components/story/StoryEditor';

export default function NewStoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useState(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/stories/new');
    }
  }, [status, router]);
  
  const handleSave = async (storyData) => {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save story');
    }
    
    const savedStory = await response.json();
    router.push(`/stories/${savedStory._id}`);
  };
  
  const handleCancel = () => {
    router.push('/stories');
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Create New Story | Sight Word Story Generator</title>
        <meta name="description" content="Create a new sight word story from scratch" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Create New Story</h1>
          </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-6">
          <StoryEditor
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </main>
      </div>
    </>
  );
}