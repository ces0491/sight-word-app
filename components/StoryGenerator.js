// components/StoryGenerator.js - Complete rewrite

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

/**
 * StoryGenerator Component
 * Shows story quality preview and generates stories from sight words
 */
const StoryGenerator = ({ 
  words = [], 
  grade = 1, 
  learningNeeds = {}, 
  includeImages = true, 
  storyFormat = 'highlighted',
  onGenerateStory,
  isGeneratingStory = false
}) => {
  const [storyQuality, setStoryQuality] = useState('limited');
  const [readabilityLevel, setReadabilityLevel] = useState('basic');
  
  /**
   * Update story quality based on number of words
   */
  useEffect(() => {
    if (words.length < 3) {
      setStoryQuality('limited');
    } else if (words.length < 6) {
      setStoryQuality('basic');
    } else if (words.length < 10) {
      setStoryQuality('good');
    } else {
      setStoryQuality('excellent');
    }
  }, [words]);
  
  /**
   * Set readability level based on grade and learning needs
   */
  useEffect(() => {
    if (learningNeeds.dyslexia || learningNeeds.visualProcessing) {
      setReadabilityLevel('simplified');
    } else if (grade <= 1) {
      setReadabilityLevel('basic');
    } else if (grade <= 3) {
      setReadabilityLevel('standard');
    } else {
      setReadabilityLevel('advanced');
    }
  }, [grade, learningNeeds]);
  
  /**
   * Handle generate story button click
   */
  const handleClick = () => {
    if (typeof onGenerateStory === 'function') {
      onGenerateStory();
    } else {
      console.error('onGenerateStory callback not provided to StoryGenerator');
    }
  };
  
  // Helper function to get quality bar width
  const getQualityWidth = () => {
    switch (storyQuality) {
      case 'excellent': return '100%';
      case 'good': return '75%';
      case 'basic': return '50%';
      default: return '25%';
    }
  };
  
  // Helper function to get quality bar color
  const getQualityColor = () => {
    switch (storyQuality) {
      case 'excellent': return 'bg-green-600';
      case 'good': return 'bg-blue-600';
      case 'basic': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };
  
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
              className={`h-2.5 rounded-full ${getQualityColor()}`} 
              style={{ width: getQualityWidth() }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Words Available:</span>
            <span className="text-sm font-medium text-blue-700">{words.length}</span>
          </div>
          
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
        onClick={handleClick}
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

export default StoryGenerator;