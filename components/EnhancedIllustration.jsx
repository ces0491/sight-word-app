import React, { useMemo } from 'react';
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

  // Drawing is quick, synchronous and repeatable, so the picture is worked out during render
  const imageUrl = useMemo(() => {
    if (!sentence) return '';
    try {
      // Generate SVG from the scene, or from the sentence's keywords
      return svgToDataURL(generateIllustration(sentence, { storySeed, scene, location }));
    } catch (error) {
      console.error('Error generating illustration:', error);
      return '';
    }
  }, [sentence, storySeed, scene, location]);

  // alt="" marks a decorative picture (the sentence is shown beside it)
  const illustrationAlt = alt ?? `Illustration for: ${sentence}`;

  if (!imageUrl) return <div className={className} style={{ width, height }} />;

  return (
    <div className={className} style={{ width, height }}>
      {/* An SVG data URL drawn in the browser: next/image has nothing to optimise */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
