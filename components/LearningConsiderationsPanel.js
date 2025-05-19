// components/LearningConsiderationsPanel.js
import React from 'react';
import { Info } from 'lucide-react';

/**
 * Enhanced Learning Considerations Panel
 * 
 * Features:
 * - Improved contrast and readability
 * - Clearer explanations of adaptations
 * - Visual indicators of what changes with each option
 * - Easy-to-understand labels
 */
const LearningConsiderationsPanel = ({ 
  learningNeeds, 
  setLearningNeeds, 
  onInfoClick 
}) => {
  /**
   * Toggle a specific learning need
   * 
   * @param {string} need - The learning need to toggle
   */
  const toggleNeed = (need) => {
    setLearningNeeds({
      ...learningNeeds,
      [need]: !learningNeeds[need]
    });
  };
  
  /**
   * Get description for each learning need
   * 
   * @param {string} need - The learning need
   * @returns {string} - Short description
   */
  const getNeedDescription = (need) => {
    switch (need) {
      case 'adhd':
        return 'Shorter focused segments with fewer distractions';
      case 'dyslexia':
        return 'Improved spacing and specialized fonts';
      case 'autism':
        return 'Predictable structure and clear transitions';
      case 'esl':
        return 'Simplified language and vocabulary support';
      case 'visualProcessing':
        return 'Enhanced contrast and explicit formatting';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800 text-base">Learning Considerations</h3>
        <button 
          type="button"
          onClick={onInfoClick}
          className="text-blue-600 text-sm flex items-center hover:text-blue-800"
          aria-label="Learn more about learning considerations"
        >
          <Info size={16} className="mr-1" /> Learn more
        </button>
      </div>
      
      {/* ADHD */}
      <div className="bg-white border border-gray-200 rounded-md p-3 hover:border-blue-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="adhd"
              checked={learningNeeds.adhd}
              onChange={() => toggleNeed('adhd')}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="adhd" className="font-medium text-gray-800 block cursor-pointer">
              ADHD
            </label>
            <p className="text-sm text-gray-700">{getNeedDescription('adhd')}</p>
            {learningNeeds.adhd && (
              <div className="mt-2 text-xs bg-blue-50 text-blue-800 p-2 rounded">
                Activates: Shorter paragraphs, increased visual cues, and reduced distractions
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dyslexia */}
      <div className="bg-white border border-gray-200 rounded-md p-3 hover:border-purple-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="dyslexia"
              checked={learningNeeds.dyslexia}
              onChange={() => toggleNeed('dyslexia')}
              className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="dyslexia" className="font-medium text-gray-800 block cursor-pointer">
              Dyslexia
            </label>
            <p className="text-sm text-gray-700">{getNeedDescription('dyslexia')}</p>
            {learningNeeds.dyslexia && (
              <div className="mt-2 text-xs bg-purple-50 text-purple-800 p-2 rounded">
                Activates: Comic Neue font, increased letter spacing, and larger text size
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Autism */}
      <div className="bg-white border border-gray-200 rounded-md p-3 hover:border-green-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="autism"
              checked={learningNeeds.autism}
              onChange={() => toggleNeed('autism')}
              className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="autism" className="font-medium text-gray-800 block cursor-pointer">
              Autism Spectrum
            </label>
            <p className="text-sm text-gray-700">{getNeedDescription('autism')}</p>
            {learningNeeds.autism && (
              <div className="mt-2 text-xs bg-green-50 text-green-800 p-2 rounded">
                Activates: Consistent structure, clear sentence patterns, and explicit transitions
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ESL */}
      <div className="bg-white border border-gray-200 rounded-md p-3 hover:border-yellow-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="esl"
              checked={learningNeeds.esl}
              onChange={() => toggleNeed('esl')}
              className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="esl" className="font-medium text-gray-800 block cursor-pointer">
              English as Second Language
            </label>
            <p className="text-sm text-gray-700">{getNeedDescription('esl')}</p>
            {learningNeeds.esl && (
              <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
                Activates: Simplified vocabulary, clearer sentence structure, and visual supports
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Visual Processing */}
      <div className="bg-white border border-gray-200 rounded-md p-3 hover:border-red-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="visualProcessing"
              checked={learningNeeds.visualProcessing}
              onChange={() => toggleNeed('visualProcessing')}
              className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="visualProcessing" className="font-medium text-gray-800 block cursor-pointer">
              Visual Processing
            </label>
            <p className="text-sm text-gray-700">{getNeedDescription('visualProcessing')}</p>
            {learningNeeds.visualProcessing && (
              <div className="mt-2 text-xs bg-red-50 text-red-800 p-2 rounded">
                Activates: High contrast colors, increased text size, and enhanced formatting
              </div>
            )}
          </div>
        </div>
      </div>
      
      {Object.values(learningNeeds).some(need => need) && (
        <div className="mt-3 bg-indigo-50 p-3 rounded-md">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">Active adaptations:</span> Stories will be modified to support the selected learning considerations.
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningConsiderationsPanel;