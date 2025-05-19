import React, { useEffect, useState } from 'react';
import { generateEnhancedSVG, svgToDataURL } from '../lib/imageGeneration';

/**
 * Enhanced SVG Illustration Component
 * 
 * Features:
 * - Improved aesthetics with detailed illustrations
 * - Support for different learning needs
 * - Responsive design for various screen sizes
 * - Accessibility features
 * - Loading states
 */
const EnhancedIllustration = ({
  sentence,
  alt,
  width = 400,
  height = 200,
  learningNeeds = {},
  className = '',
  fadeIn = true
}) => {
  const [svgUrl, setSvgUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sentence) {
      setError('No sentence provided');
      setIsLoading(false);
      return;
    }

    try {
      // Generate SVG for the sentence
      const svg = generateEnhancedSVG(sentence, { learning: learningNeeds });
      
      // Convert to data URL
      const url = svgToDataURL(svg);
      
      setSvgUrl(url);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error generating illustration:', err);
      setError('Failed to generate illustration');
      setIsLoading(false);
    }
  }, [sentence, learningNeeds]);

  // Generate appropriate alt text if not provided
  const accessibleAlt = alt || `Illustration for: ${sentence}`;
  
  // Determine loading and error states
  if (isLoading) {
    return (
      <div 
        className={`relative rounded-md bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width: width, height: height }}
        role="status"
        aria-label="Loading illustration"
      >
        <div className="animate-pulse flex flex-col items-center">
          <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="mt-2 text-sm text-gray-500">Creating illustration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`relative rounded-md bg-red-50 flex items-center justify-center ${className}`}
        style={{ width: width, height: height }}
        role="alert"
      >
        <div className="text-center p-4">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  // Render the SVG illustration
  return (
    <div 
      className={`relative ${fadeIn ? 'animate-fadeIn' : ''} ${className}`}
      style={{ width: width, height: height }}
    >
      <img
        src={svgUrl}
        alt={accessibleAlt}
        className="w-full h-full object-contain rounded-md"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          // Apply high contrast if needed for visual processing
          filter: learningNeeds.visualProcessing ? 'contrast(1.2)' : 'none'
        }}
        loading="lazy"
      />
    </div>
  );
};

export default EnhancedIllustration;