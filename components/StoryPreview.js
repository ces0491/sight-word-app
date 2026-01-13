import React from 'react';
import StoryIllustration from './EnhancedIllustration';

/**
 * StoryPreview Component
 * 
 * Displays a generated story with sight words highlighted and illustrations
 * 
 * @param {object} props.story - The generated story to display
 * @param {function} props.onSave - Function to call when saving the story
 * @param {function} props.onShare - Function to call when sharing the story
 * @param {function} props.onPrint - Function to call when printing the story
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated
 * @param {boolean} props.isSaving - Whether the story is currently being saved
 */
const StoryPreview = ({
  story,
  onSave,
  onShare,
  onPrint,
  isAuthenticated = false,
  isSaving = false
}) => {
  // Ensure we have a story to display
  if (!story) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-500">Add some sight words to generate a story</p>
      </div>
    );
  }

  // Highlight sight words in the text
  const highlightSightWords = (text, words) => {
    if (!words || words.length === 0) return text;

    let highlightedText = text;
    
    words.forEach(word => {
      // Create a regex that matches the whole word with word boundaries
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="highlight">$&</span>`);
    });
    
    return highlightedText;
  };

  // Format the displayed text based on selected format
  const formatText = (sentence, words, format = story.format || 'highlighted') => {
    switch (format) {
      case 'highlighted':
        return <span dangerouslySetInnerHTML={{ __html: highlightSightWords(sentence, words) }} className="highlighted-text" />;
      case 'bold':
        return <span dangerouslySetInnerHTML={{ 
          __html: highlightSightWords(sentence, words).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<strong>$1</strong>'
          ) 
        }} />;
      case 'underlined':
        return <span dangerouslySetInnerHTML={{ 
          __html: highlightSightWords(sentence, words).replace(
            /<span class="highlight">(.*?)<\/span>/g, 
            '<u>$1</u>'
          ) 
        }} />;
      case 'normal':
      default:
        return sentence;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto">
      {/* Story Control Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{story.title}</h2>
        
        <div className="flex gap-2">
          {onPrint && (
            <button 
              onClick={onPrint}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print
            </button>
          )}

          {isAuthenticated && onSave && (
            <button 
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save
                </>
              )}
            </button>
          )}
          
          {isAuthenticated && onShare && (
            <button 
              onClick={onShare}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
          )}
        </div>
      </div>
      
      {/* Story metadata */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Uses {(story.usedWords || story.words).length} of {story.words?.length || 0} sight words
          {story.coveragePercent && ` (${story.coveragePercent}% coverage)`}
          {' '} • Grade {story.grade} level
          {story.learningNeeds && Object.entries(story.learningNeeds)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .length > 0 && ` • Optimized for ${Object.entries(story.learningNeeds)
              .filter(([_, value]) => value)
              .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
              .join(', ')}`
          }
        </p>
      </div>
      
      {/* Story content with illustrations */}
      <div className="space-y-8">
        {story.content.map((sentence, index) => (
          <div key={index} className="story-page p-4 bg-white rounded-lg shadow-md">
            {/* Text with highlighted sight words */}
            <p className="text-xl leading-relaxed mb-4 font-comic text-gray-800">
              {formatText(sentence, story.usedWords || story.words)}
            </p>
            
            {/* Illustration for this sentence */}
            {story.includeImages && (
              <StoryIllustration 
                sentence={sentence} 
                width="100%" 
                height={200} 
                alt={`Illustration for: ${sentence}`}
                className="mt-2"
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Words used */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Sight Words Used:</h3>
        <div className="flex flex-wrap gap-2">
          {(story.usedWords || story.words).map((word, index) => (
            <span
              key={index}
              className="bg-blue-100 px-3 py-1 rounded-full text-blue-800"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;