import React, { useState, useEffect } from 'react';
import { Printer, Share2, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const StoryViewer = ({ story, onBack, showShareDialog }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [aiIllustrations, setAiIllustrations] = useState({});
  const [isGeneratingImages, setIsGeneratingImages] = useState({});

  // Highlighted text rendering
  const renderHighlightedText = (text, words) => {
    return words.reduce((acc, word) => {
      // Create a regular expression that matches the whole word (with word boundaries)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return acc.replace(regex, `<span class="highlight">$&</span>`);
    }, text);
  };

  // Format the displayed text based on selected format
  const formatText = (sentence, words, format) => {
    switch (format) {
      case 'highlighted':
        return <span dangerouslySetInnerHTML={{ __html: renderHighlightedText(sentence, words) }} className="highlighted-text" />;
      case 'bold':
        return <span dangerouslySetInnerHTML={{ 
          __html: renderHighlightedText(sentence, words).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<strong>$1</strong>'
          ) 
        }} />;
      case 'underlined':
        return <span dangerouslySetInnerHTML={{ 
          __html: renderHighlightedText(sentence, words).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<u>$1</u>'
          ) 
        }} />;
      case 'normal':
      default:
        return sentence;
    }
  };

  // Generate an illustration based on a sentence
  const getIllustrationForSentence = async (sentence) => {
    // Check if we already have an illustration for this sentence
    if (aiIllustrations[sentence]) {
      return aiIllustrations[sentence];
    }
    
    // Mark this sentence as loading an illustration
    setIsGeneratingImages(prev => ({ ...prev, [sentence]: true }));
    
    try {
      // In a production app, this would call an API to generate an image
      // For now, we'll use placeholder images but simulate a delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder illustrations (in production, would be AI generated)
      const illustrations = [
        "https://picsum.photos/seed/img1/400/240",
        "https://picsum.photos/seed/img2/400/240",
        "https://picsum.photos/seed/img3/400/240"
      ];
      
      // Use a hash of the sentence to consistently get the same illustration for the same sentence
      const hash = sentence.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const imageUrl = illustrations[hash % illustrations.length];
      
      // Save the illustration for this sentence
      setAiIllustrations(prev => ({ ...prev, [sentence]: imageUrl }));
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      // Fallback to a default image
      return "https://picsum.photos/seed/fallback/400/240";
    }
  };

  if (!story) return <div>No story found</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{story.title}</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md"
          >
            <Printer size={16} /> Print
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md"
          >
            <Download size={16} /> Download
          </button>
          {session?.user && (
            <button 
              onClick={showShareDialog}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md"
            >
              <Share2 size={16} /> Share
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Contains {story.words.length} sight words • Grade {story.grade} level
          {Object.entries(story.learningNeeds)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .length > 0 && ` • Optimized for ${Object.entries(story.learningNeeds)
              .filter(([_, value]) => value)
              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
              .join(', ')}`
          }
        </p>
      </div>
      
      <div className="story-book bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto">
        {story.content.map((sentence, index) => (
          <div key={index} className="mb-8">
            <div className="story-page p-4 bg-white rounded-lg shadow-md">
              <p className="text-xl leading-relaxed mb-4 font-comic text-gray-800">
                {formatText(sentence, story.words, story.format)}
              </p>
              
              {story.includeImages && (
                <div className="h-40 relative">
                  {isGeneratingImages[sentence] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                      <div className="text-center">
                        <span className="block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></span>
                        <span className="text-sm text-gray-500">Generating illustration...</span>
                      </div>
                    </div>
                  ) : (
                    <Image 
						src={aiIllustrations[sentence] || getIllustrationForSentence(sentence)}
						alt={`Illustration for: ${sentence}`}
						className="w-full h-full object-cover rounded-md"
						width={400}
						height={240}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = "https://picsum.photos/seed/error/400/240";
						}}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Words List */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Sight Words Used:</h3>
          <div className="flex flex-wrap gap-2">
            {story.words.map((word, index) => (
              <span key={index} className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;