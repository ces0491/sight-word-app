import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { BookOpen, Plus, Search, Trash2, Edit, Book } from 'lucide-react';

export default function StoriesPage() {
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      router.push('/auth/signin?callbackUrl=/stories');
    }
  });
  
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/stories');
    } else if (status === 'authenticated') {
      fetchStories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);
  
  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setStories(stories.filter(story => story._id !== id));
      } else {
        console.error('Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };
  
  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.words.some(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'grade') {
      return a.grade - b.grade;
    }
    return 0;
  });
  
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading stories...</p>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>My Stories | Sight Word Story Generator</title>
        <meta name="description" content="Manage your saved sight word stories" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Stories</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/stories/new')}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus size={18} className="mr-1" /> New Story
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
              >
                <Book size={18} className="mr-1" /> Generator
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3"
                  placeholder="Search stories or words..."
                />
              </div>
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md py-2 px-3 text-gray-700"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title</option>
                  <option value="grade">Grade Level</option>
                </select>
              </div>
            </div>
            
            {/* Stories List */}
            {sortedStories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={64} className="mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl font-medium text-gray-600">No stories found</h2>
                <p className="mt-2 text-gray-500">
                  {searchTerm 
                    ? "No stories match your search. Try different keywords." 
                    : "You haven't created any stories yet."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => router.push('/stories/new')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Create Your First Story
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedStories.map((story) => (
                  <div key={story._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{story.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(story.createdAt).toLocaleDateString()} • 
                          {story.words.length} words • Grade {story.grade}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/stories/${story._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="View Story"
                        >
                          <Book size={18} />
                        </button>
                        <button 
                          onClick={() => router.push(`/stories/${story._id}/edit`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Edit Story"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(story._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete Story"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 line-clamp-2">
                        {story.content[0]}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {story.words.slice(0, 5).map((word, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                            {word}
                          </span>
                        ))}
                        {story.words.length > 5 && (
                          <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                            +{story.words.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {}
  }
}