import React, { useState, useEffect } from 'react';
import { generateStory } from '../lib/storyGeneration';
import StoryIllustration from './EnhancedIllustration';

/**
 * Enhanced Story Preview Component
 * 
 * Displays a story with sight words highlighted and illustrations
 */
const EnhancedStoryPreview = ({ 
  words = [], 
  grade = 1, 
  highlightColor = '#FFEB3B' 
}) => {
  const [story, setStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate story when words change
  useEffect(() => {
    if (words.length === 0) {
      setStory(null);
      return;
    }

    setIsGenerating(true);
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        const generatedStory = generateStory(words, grade);
        setStory(generatedStory);
      } catch (error) {
        console.error('Error generating story:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  }, [words, grade]);

  // Highlight sight words in the text
  const highlightSightWords = (text) => {
    if (!words || words.length === 0) return text;

    let highlightedText = text;
    
    words.forEach(word => {
      // Create a regex that matches the whole word with word boundaries
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="highlight">$&</span>`);
    });
    
    return highlightedText;
  };

  if (isGenerating) {
    return (
      <div className="animate-pulse bg-white rounded-lg p-6 max-w-3xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-40 bg-gray-200 rounded mt-4"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-500">Add some sight words to generate a story</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto">
      {/* Story title */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{story.title}</h2>
      
      {/* Story content with illustrations */}
      <div className="space-y-8">
        {story.content.map((sentence, index) => (
          <div key={index} className="story-page p-4 bg-white rounded-lg shadow-md">
            {/* Text with highlighted sight words */}
            <p 
              className="text-xl leading-relaxed mb-4 font-comic text-gray-800"
              dangerouslySetInnerHTML={{ __html: highlightSightWords(sentence) }}
              style={{ '--highlight-color': highlightColor }}
            ></p>
            
            {/* Illustration for this sentence */}
            <StoryIllustration 
              sentence={sentence} 
              width="100%" 
              height={200} 
              alt={`Illustration for: ${sentence}`}
              className="mt-2"
            />
          </div>
        ))}
      </div>
      
      {/* Words used */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Sight Words Used:</h3>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <span 
              key={index} 
              className="px-3 py-1 rounded-full text-gray-800"
              style={{ backgroundColor: highlightColor }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoryPreview;