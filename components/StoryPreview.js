// components/fixedComponents/StoryPreview.js (with complete illustration implementation)
import React, { useState, useEffect, useCallback } from 'react';
import { Printer, Save, Share2, Download } from 'lucide-react';
import Image from 'next/image';

/**
 * Complete implementation of the StoryPreview component with illustration generation
 * This component doesn't rely on any external functions for image generation
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
  const [illustrations, setIllustrations] = useState({});
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
  
  // COMPLETE IMPLEMENTATION: Generate SVG for sentences
  const generateSVGForSentence = useCallback((sentence) => {
    // Helper function to extract key elements from sentence
    const extractElements = (text) => {
      const lowercaseSentence = text.toLowerCase();
      
      // Extract location
      const locations = ['park', 'school', 'house', 'home', 'beach', 'playground', 'store'];
      const location = locations.find(loc => lowercaseSentence.includes(loc)) || 'default';
      
      // Extract characters
      const characters = [];
      if (lowercaseSentence.includes(' i ') || lowercaseSentence.startsWith('i ')) {
        characters.push('narrator');
      }
      
      // Check for animals
      const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit'];
      animals.forEach(animal => {
        if (lowercaseSentence.includes(animal)) {
          characters.push(animal);
        }
      });
      
      // If no specific characters found, add a default
      if (characters.length === 0) {
        characters.push('child');
      }
      
      return { location, characters };
    };
    
    // Generate background based on location
    const generateBackground = (location) => {
      if (location === 'park') {
        return `
          <rect width="400" height="200" fill="#E8F5E9"/>
          <rect width="400" height="70" y="130" fill="#81C784" />
          <circle cx="350" cy="40" r="20" fill="#FFEB3B" />
          <path d="M280,140 Q300,110 320,140" stroke="#5D4037" stroke-width="10" fill="none" />
          <path d="M280,140 L280,70 Q310,70 300,50 Q290,30 320,40 Q350,50 340,70 Q370,70 360,140" fill="#2E7D32" />
        `;
      } else if (location === 'school') {
        return `
          <rect width="400" height="200" fill="#E3F2FD"/>
          <rect width="400" height="70" y="130" fill="#90CAF9" />
          <rect x="100" y="50" width="200" height="100" fill="#BBDEFB" stroke="#1565C0" stroke-width="3" />
          <rect x="180" y="100" width="40" height="50" fill="#1565C0" />
          <path d="M100,50 L200,10 L300,50" fill="#EF5350" stroke="#C62828" stroke-width="3" />
        `;
      } else if (location === 'house' || location === 'home') {
        return `
          <rect width="400" height="200" fill="#F5F5F5"/>
          <rect width="400" height="70" y="130" fill="#9E9E9E" />
          <rect x="120" y="60" width="160" height="100" fill="#FFCCBC" stroke="#5D4037" stroke-width="2" />
          <rect x="170" y="110" width="40" height="50" fill="#5D4037" />
          <path d="M120,60 L200,20 L280,60" fill="#FF7043" stroke="#E64A19" stroke-width="2" />
        `;
      } else {
        return `
          <rect width="400" height="200" fill="#F5F5F5"/>
          <rect width="400" height="70" y="130" fill="#E0E0E0" />
          <circle cx="350" cy="40" r="20" fill="#FFC107" />
        `;
      }
    };
    
    // Generate character based on type
    const generateCharacter = (type, x, y) => {
      if (type === 'dog') {
        return `
          <ellipse cx="${x}" cy="${y+40}" rx="25" ry="15" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
          <circle cx="${x-15}" cy="${y+25}" r="12" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
          <circle cx="${x-20}" cy="${y+22}" r="3" fill="#5D4037" />
          <circle cx="${x-10}" cy="${y+22}" r="3" fill="#5D4037" />
          <ellipse cx="${x-15}" cy="${y+28}" rx="3" ry="2" fill="#5D4037" />
          <rect x="${x-25}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
          <rect x="${x-5}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
          <rect x="${x+13}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
        `;
      } else if (type === 'cat') {
        return `
          <ellipse cx="${x}" cy="${y+40}" rx="20" ry="12" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
          <circle cx="${x-10}" cy="${y+25}" r="10" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
          <path d="M${x-18},${y+20} L${x-25},${y+15}" stroke="#BDBDBD" stroke-width="2" fill="none" />
          <path d="M${x-2},${y+20} L${x+5},${y+15}" stroke="#BDBDBD" stroke-width="2" fill="none" />
          <circle cx="${x-13}" cy="${y+22}" r="2" fill="#424242" />
          <circle cx="${x-7}" cy="${y+22}" r="2" fill="#424242" />
          <ellipse cx="${x-10}" cy="${y+27}" rx="2" ry="1" fill="#424242" />
        `;
      } else {
        // Child or narrator (default)
        return `
          <circle cx="${x}" cy="${y}" r="20" fill="#FFCCBC" stroke="#5D4037" stroke-width="1" />
          <path d="M${x-8},${y+5} Q${x},${y+8} ${x+8},${y+5}" stroke="#5D4037" stroke-width="1.5" fill="none" />
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#5D4037" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#5D4037" />
          <rect x="${x-15}" y="${y+20}" width="30" height="30" rx="2" fill="#3F51B5" stroke="#303F9F" stroke-width="1" />
          <rect x="${x-15}" y="${y+50}" width="10" height="20" fill="#7986CB" />
          <rect x="${x+5}" y="${y+50}" width="10" height="20" fill="#7986CB" />
        `;
      }
    };
    
    // Extract elements from the sentence
    const elements = extractElements(sentence);
    
    // Create the SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">`;
    
    // Add background
    svg += generateBackground(elements.location);
    
    // Add characters
    if (elements.characters.length === 1) {
      svg += generateCharacter(elements.characters[0], 150, 100);
    } else if (elements.characters.length >= 2) {
      svg += generateCharacter(elements.characters[0], 120, 100);
      svg += generateCharacter(elements.characters[1], 280, 100);
    }
    
    // Close SVG
    svg += `</svg>`;
    
    return svg;
  }, []);
  
  // Convert SVG to data URL
  const svgToDataURL = useCallback((svg) => {
    // For browsers
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    }
    
    // Fallback
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, []);
  
  // Generate illustration for a sentence
  const generateIllustrationForSentence = useCallback(async (sentence) => {
    // Check if we already have an illustration for this sentence
    if (illustrations[sentence]) {
      return illustrations[sentence];
    }
    
    // Mark this sentence as loading an illustration
    setIsGeneratingImages(prev => ({ ...prev, [sentence]: true }));
    
    try {
      // Generate SVG illustration
      const svgContent = generateSVGForSentence(sentence);
      
      // Convert to data URL
      const dataUrl = svgToDataURL(svgContent);
      
      // Store the illustration
      setIllustrations(prev => ({ ...prev, [sentence]: dataUrl }));
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      return dataUrl;
    } catch (error) {
      console.error('Failed to generate illustration:', error);
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      // Fallback - create a unique seed from the sentence
      const seed = Array.from(sentence).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `https://picsum.photos/seed/${seed}/400/240`;
    }
  }, [illustrations, generateSVGForSentence, svgToDataURL]);
  
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
    
    // Generate illustrations for all sentences
    if (story.includeImages) {
      story.content.forEach(sentence => {
        generateIllustrationForSentence(sentence);
      });
    }
  }, [story, generateIllustrationForSentence]);
  
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
                        src={illustrations[sentence] || `/api/placeholder/${index + 1}`}
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