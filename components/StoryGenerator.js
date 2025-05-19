// components/storyGenerator.js
import React, { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { generateEnhancedStory } from '../lib/storyGeneration';

/**
 * Improved Story Generator Component
 * 
 * Uses enhanced story generation algorithm to:
 * 1. Add randomness to story generation (different stories each time)
 * 2. Ensure all sight words are used when possible
 * 3. Track which words were actually used for better feedback
 */
const ImprovedStoryGenerator = ({ 
  words, 
  grade, 
  learningNeeds, 
  includeImages, 
  storyFormat,
  onGenerateStory,
  isGeneratingStory
}) => {
  const [storyQuality, setStoryQuality] = useState('normal');
  const [readabilityLevel, setReadabilityLevel] = useState('auto');
  const [usedWordCount, setUsedWordCount] = useState(0);
  const [lastGeneratedStory, setLastGeneratedStory] = useState(null);
  
  // Calculate the readability level based on grade and learning needs
  useEffect(() => {
    if (learningNeeds.dyslexia || learningNeeds.visualProcessing) {
      // Lower readability level for students with these learning needs
      setReadabilityLevel('simplified');
    } else if (grade <= 1) {
      // Very simple for kindergarten and 1st grade
      setReadabilityLevel('basic');
    } else if (grade <= 3) {
      // Standard for 2nd-3rd grade
      setReadabilityLevel('standard');
    } else {
      // More advanced for 4th-5th grade
      setReadabilityLevel('advanced');
    }
  }, [grade, learningNeeds]);
  
  /**
   * Handle story generation with improved algorithm
   */
  const handleGenerateStory = async () => {
    if (words.length === 0 || isGeneratingStory) return;
    
    try {
      // Generate a coherent story using the enhanced engine
      const storyData = generateEnhancedStory(
        words, 
        grade,
        learningNeeds
      );
      
      // Update used word count for stats display
      setUsedWordCount(storyData.usedWords.length);
      setLastGeneratedStory(storyData);
      
      // Create the full story object with all needed metadata
      const story = {
        id: Date.now(),
        title: storyData.title,
        content: storyData.content,
        words: [...words],
        usedWords: storyData.usedWords || [], // Track which words were actually used
        format: storyFormat,
        includeImages,
        grade,
        learningNeeds: {...learningNeeds},
        timestamp: new Date().toISOString()
      };
      
      // Pass the generated story back to the parent component
      onGenerateStory(story);
      
    } catch (error) {
      console.error('Story generation error:', error);
      // Handle generation errors
    }
  };
  
  /**
   * Calculate a quality score based on the number of words
   * @returns {string} - Quality description
   */
  const calculateStoryQuality = useCallback(() => {
    if (words.length < 3) return 'limited';
    if (words.length < 6) return 'basic';
    if (words.length < 10) return 'good';
    return 'excellent';
  }, [words.length]);
  
  /**
   * Update story quality when words change
   */
  useEffect(() => {
    setStoryQuality(calculateStoryQuality());
  }, [calculateStoryQuality]);
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Story Quality Preview</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Quality:</span>
            <span className="text-sm font-medium text-blue-700 capitalize">{storyQuality}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                storyQuality === 'excellent' ? 'bg-green-600' : 
                storyQuality === 'good' ? 'bg-blue-600' : 
                storyQuality === 'basic' ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ 
                width: `${
                  storyQuality === 'excellent' ? '100%' : 
                  storyQuality === 'good' ? '75%' : 
                  storyQuality === 'basic' ? '50%' : '25%'
                }` 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Words Available:</span>
            <span className="text-sm font-medium text-blue-700">{words.length}</span>
          </div>
          
          {lastGeneratedStory && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Words Used in Story:</span>
              <span className="text-sm font-medium text-blue-700">
                {lastGeneratedStory.usedWords.length}/{words.length}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Reading Level:</span>
            <span className="text-sm font-medium text-blue-700 capitalize">{readabilityLevel}</span>
          </div>
          
          {learningNeeds && Object.values(learningNeeds).some(need => need) && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <span className="text-sm text-gray-700">Learning Adaptations:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {learningNeeds.adhd && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">ADHD</span>
                )}
                {learningNeeds.dyslexia && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Dyslexia</span>
                )}
                {learningNeeds.autism && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Autism</span>
                )}
                {learningNeeds.esl && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">ESL</span>
                )}
                {learningNeeds.visualProcessing && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Visual</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={handleGenerateStory}
        disabled={words.length === 0 || isGeneratingStory}
        className={`w-full py-3 rounded-md flex items-center justify-center gap-2 
          ${words.length === 0 || isGeneratingStory 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700'}`}
        aria-label="Generate story with current words"
      >
        {isGeneratingStory ? (
          <>
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span>Creating Your Story...</span>
          </>
        ) : (
          <>
            <Zap size={20} />
            <span>Generate Story</span>
          </>
        )}
      </button>
      
      {words.length > 0 && !isGeneratingStory && (
        <div className="text-sm text-gray-600 text-center">
          {storyQuality === 'limited' ? (
            <p>Adding more words will help create a better story. Try adding at least 5 words.</p>
          ) : storyQuality === 'basic' ? (
            <p>Your story will be basic. Add more diverse words for a better story.</p>
          ) : storyQuality === 'good' ? (
            <p>Your story will be good. Ready to generate!</p>
          ) : (
            <p>Your story will be excellent with lots of details!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImprovedStoryGenerator;