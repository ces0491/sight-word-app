import React, { useState, useEffect } from 'react';
import { generateIllustration, svgToDataURL } from '../lib/imageGeneration';

/**
 * StoryIllustration Component
 * Generates and displays illustrations for sight word stories
 *
 * @param {object} props
 * @param {string} props.sentence
 * @param {{ storySeed?: number, scene?: string|null, location?: string }} [props.options]
 *   This page's entry from planIllustrations(story), so pages share one cast and setting
 */
const StoryIllustration = ({
  sentence,
  options,
  width = 400,
  height = 200,
  alt,
  className = ''
}) => {
  const storySeed = options?.storySeed;
  const scene = options?.scene;
  const location = options?.location;

  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sentence) {
      setIsLoading(false);
      return;
    }

    try {
      // Generate SVG from the scene, or from the sentence's keywords
      const svg = generateIllustration(sentence, { storySeed, scene, location });
      
      // Convert to data URL for the img src
      const url = svgToDataURL(svg);
      
      setImageUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating illustration:', error);
      setIsLoading(false);
    }
  }, [sentence, storySeed, scene, location]);

  // Accessible alt text
  const illustrationAlt = alt || `Illustration for: ${sentence}`;

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse text-center">
          <svg className="w-10 h-10 mx-auto text-gray-400" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
              <animateTransform 
                attributeName="transform" 
                attributeType="XML" 
                type="rotate"
                dur="1s" 
                from="0 12 12"
                to="360 12 12" 
                repeatCount="indefinite" 
              />
            </path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Generating illustration...</p>
        </div>
      </div>
    );
  }

  // Show the generated illustration
  return (
    <div className={className} style={{ width, height }}>
      <img
        src={imageUrl}
        alt={illustrationAlt}
        className="w-full h-full object-contain"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};

export default StoryIllustration;