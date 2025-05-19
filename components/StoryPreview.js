// components/fixedComponents/StoryPreview.js
import React, { useState, useEffect, useCallback } from 'react';
import { Printer, Save, Share2, Download, Book } from 'lucide-react';
import Image from 'next/image';
import { svgToDataURL } from '../lib/imageGeneration';

/**
 * Enhanced Story Preview Component with ESLint fixes
 * 
 * Features:
 * - Improved visualization of sight words based on format
 * - Better adaptations for different learning needs
 * - Higher contrast and readability
 * - Responsive design for all devices
 * - Fixed ESLint warnings with useCallback
 */
const StoryPreview = ({ 
  story,
  onSave,
  onShare,
  onPrint,
  onDownload,
  isAuthenticated = false,
  isSaving = false
}) => {
  const [aiIllustrations, setAiIllustrations] = useState({});
  const [isGeneratingImages, setIsGeneratingImages] = useState({});
  const [appliedStyles, setAppliedStyles] = useState({});
  
  // Get descriptions for active learning needs
  const getActiveAdaptations = () => {
    if (!story || !story.learningNeeds) return [];
    
    const activeNeeds = [];
    if (story.learningNeeds.adhd) activeNeeds.push('ADHD');
    if (story.learningNeeds.dyslexia) activeNeeds.push('Dyslexia');
    if (story.learningNeeds.autism) activeNeeds.push('Autism Spectrum');
    if (story.learningNeeds.esl) activeNeeds.push('ESL');
    if (story.learningNeeds.visualProcessing) activeNeeds.push('Visual Processing');
    
    return activeNeeds;
  };
  
  // Simplified SVG generation function if image generation library isn't available
  const generateSVGForSentence = useCallback(async (sentence) => {
    // This is a fallback implementation if your real implementation isn't ready
    // It creates a simple SVG with the first letter of the sentence
    const firstLetter = sentence.charAt(0).toUpperCase();
    const colors = ['#4299E1', '#48BB78', '#F6AD55', '#F56565', '#9F7AEA', '#ED64A6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#f8fafc" />
      <circle cx="200" cy="100" r="80" fill="${color}" opacity="0.2" />
      <text x="200" y="130" font-family="Arial" font-size="100" text-anchor="middle" fill="${color}">${firstLetter}</text>
    </svg>`;
  }, []);
  
  // Generate an illustration for a sentence - wrapped in useCallback to fix ESLint warning
  const getIllustrationForSentence = useCallback(async (sentence) => {
    // Check if we already have an illustration for this sentence
    if (aiIllustrations[sentence]) {
      return aiIllustrations[sentence];
    }
    
    // Mark this sentence as loading an illustration
    setIsGeneratingImages(prev => ({ ...prev, [sentence]: true }));
    
    try {
      // Generate SVG illustration from the sentence content
      const svgIllustration = await generateSVGForSentence(sentence);
      
      // Convert SVG to a data URL for display
      const imageUrl = svgToDataURL(svgIllustration);
      
      // Save the illustration for this sentence
      setAiIllustrations(prev => ({ ...prev, [sentence]: imageUrl }));
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      // Fallback to a placeholder image
      return `https://picsum.photos/seed/${encodeURIComponent(sentence)}/400/240`;
    }
  }, [aiIllustrations, generateSVGForSentence]);
  
  // Apply CSS variables based on learning needs
  useEffect(() => {
    if (!story || !story.learningNeeds) return;
    
    const root = document.documentElement;
    const newStyles = {};
    
    // Reset to defaults
    root.style.setProperty('--font-size-base', '1rem');
    root.style.setProperty('--line-spacing', '1.5');
    root.style.setProperty('--word-spacing', 'normal');
    root.style.setProperty('--letter-spacing', 'normal');
    root.style.setProperty('--highlight-color', '#FFEB3B');
    root.style.setProperty('--font-family', 'Arial, sans-serif');
    root.style.setProperty('--text-color', '#171717');
    root.style.setProperty('--background-color', '#FFFFFF');
    
    // Apply real adaptations based on learning needs
    if (story.learningNeeds.dyslexia) {
      newStyles.fontFamily = 'Comic Neue, cursive';
      newStyles.fontSize = '1.25rem';
      newStyles.lineHeight = '2.2';
      newStyles.wordSpacing = '0.3em';
      newStyles.letterSpacing = '0.05em';
      
      root.style.setProperty('--font-family', 'Comic Neue, cursive');
      root.style.setProperty('--font-size-base', '1.25rem');
      root.style.setProperty('--line-spacing', '2.2');
      root.style.setProperty('--word-spacing', '0.3em');
      root.style.setProperty('--letter-spacing', '0.05em');
    }
    
    if (story.learningNeeds.visualProcessing) {
      newStyles.highlightColor = '#FF9800';
      newStyles.textColor = '#000000';
      newStyles.backgroundColor = '#f8f9fa';
      
      root.style.setProperty('--highlight-color', '#FF9800');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--background-color', '#f8f9fa');
    }
    
    // Apply grade level adjustments
    if (story.grade <= 1) {
      // Larger text for younger grades
      const fontSize = newStyles.fontSize || '1rem';
      newStyles.fontSize = parseFloat(fontSize) * 1.15 + 'rem';
      root.style.setProperty('--font-size-base', newStyles.fontSize);
    }
    
    setAppliedStyles(newStyles);
    
    // If the story includes images, generate them for each sentence
    if (story.includeImages) {
      story.content.forEach(sentence => {
        getIllustrationForSentence(sentence);
      });
    }
  }, [story, getIllustrationForSentence]);
  
  // Process text based on selected word format
  const renderHighlightedText = (text) => {
    if (!story || !story.words) return text;
    
    return story.words.reduce((acc, word) => {
      // Create a regular expression that matches the whole word (with word boundaries)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return acc.replace(regex, `<span class="highlight">$&</span>`);
    }, text);
  };
  
  // Format text based on selected style and learning needs
  const formatText = (sentence) => {
    if (!story) return sentence;
    
    switch (story.format) {
      case 'highlighted':
        return <span dangerouslySetInnerHTML={{ __html: renderHighlightedText(sentence) }} className="highlighted-text" />;
      case 'bold':
        return <span dangerouslySetInnerHTML={{ 
          __html: renderHighlightedText(sentence).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<strong>$1</strong>'
          ) 
        }} />;
      case 'underlined':
        return <span dangerouslySetInnerHTML={{ 
          __html: renderHighlightedText(sentence).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<u>$1</u>'
          ) 
        }} />;
      case 'normal':
      default:
        return sentence;
    }
  };
  
  if (!story) return <div>No story to preview</div>;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{story.title}</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            aria-label="Print story"
          >
            <Printer size={16} /> <span className="hidden sm:inline">Print</span>
          </button>
          
          <button 
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            aria-label="Download story"
          >
            <Download size={16} /> <span className="hidden sm:inline">Download</span>
          </button>
          
          {isAuthenticated && (
            <button 
              onClick={onSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isSaving ? 'bg-gray-400 text-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              aria-label="Save story"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>
          )}
          
          {isAuthenticated && (
            <button 
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              aria-label="Share story"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          Contains {story.words.length} sight words • Grade {story.grade} level
          {getActiveAdaptations().length > 0 && (
            <span> • Optimized for {getActiveAdaptations().join(', ')}</span>
          )}
        </p>
      </div>
      
      <div 
        className="story-book bg-gray-50 rounded-lg p-4 md:p-6 max-w-3xl mx-auto"
        style={{ backgroundColor: appliedStyles.backgroundColor }}
      >
        {story.content.map((sentence, index) => (
          <div key={index} className="mb-8 story-sentence">
            <div className="story-page p-4 bg-white rounded-lg shadow-md" style={{ 
              backgroundColor: appliedStyles.backgroundColor,
              boxShadow: appliedStyles.visualProcessing ? '0 4px 6px rgba(0, 0, 0, 0.18)' : undefined
            }}>
              <p className="text-xl leading-relaxed mb-4 font-comic text-gray-800" style={{
                fontFamily: appliedStyles.fontFamily,
                fontSize: appliedStyles.fontSize,
                lineHeight: appliedStyles.lineHeight,
                wordSpacing: appliedStyles.wordSpacing,
                letterSpacing: appliedStyles.letterSpacing,
                color: appliedStyles.textColor
              }}>
                {formatText(sentence)}
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
                    <div className="relative w-full h-full">
                      <Image 
                        src={aiIllustrations[sentence] || `/api/placeholder/${index + 1}`}
                        alt={`Illustration for: ${sentence}`}
                        className="rounded-md object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority={index < 3} // Load first 3 images with priority
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://picsum.photos/seed/error${index}/400/240`;
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Words Used List */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md" style={{ 
          backgroundColor: appliedStyles.backgroundColor
        }}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800" style={{
            color: appliedStyles.textColor
          }}>Sight Words Used:</h3>
          <div className="flex flex-wrap gap-2">
            {story.words.map((word, index) => (
              <span 
                key={index} 
                className="bg-blue-100 px-3 py-1 rounded-full text-blue-800"
                style={{
                  backgroundColor: story.format === 'highlighted' ? appliedStyles.highlightColor || '#FFEB3B' : undefined,
                  color: appliedStyles.textColor || undefined
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;