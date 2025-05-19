// components/LearningNeedsInfo.js
import React from 'react';
import { Info } from 'lucide-react';

const LearningNeedsInfo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Learning Considerations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">ADHD</h3>
            <p className="mb-2">Attention-Deficit/Hyperactivity Disorder affects a student&apos;s ability to maintain focus, control impulses, and regulate activity levels.</p>
            <h4 className="font-medium text-blue-600 mt-3">How our stories adapt:</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>Shorter, more focused story segments to maintain attention</li>
              <li>Enhanced visual formatting with high-contrast highlighting of target words</li>
              <li>Strategic placement of illustrations to re-engage attention</li>
              <li>Reduced visual distractions in the story presentation</li>
              <li>More frequent visual supports to maintain engagement</li>
              <li>Simplified page layouts to minimize distractions</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">Dyslexia</h3>
            <p className="mb-2">Dyslexia is a learning disorder that involves difficulty reading due to problems identifying speech sounds and learning how they relate to letters and words.</p>
            <h4 className="font-medium text-green-600 mt-3">How our stories adapt:</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>Increased spacing between words and lines for better readability</li>
              <li>Dyslexia-friendly font option (Comic Neue)</li>
              <li>Color highlighting to enhance word recognition</li>
              <li>Multiple encoding options (visual + textual representation)</li>
              <li>Careful font size and contrast adjustments</li>
              <li>Repetition of sight words in meaningful contexts</li>
              <li>Reduced text density per page</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">Autism Spectrum</h3>
            <p className="mb-2">Autism spectrum disorder affects how people perceive and socialize with others, causing problems in social interaction and communication.</p>
            <h4 className="font-medium text-purple-600 mt-3">How our stories adapt:</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>Predictable, structured story formats</li>
              <li>Clear, concrete language with literal meanings</li>
              <li>Consistent visual supports paired with text</li>
              <li>Reduced metaphorical language</li>
              <li>Simplified sentence structures</li>
              <li>Visual schedules and sequencing cues</li>
              <li>Consistent formatting patterns</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">English as Second Language (ESL)</h3>
            <p className="mb-2">ESL students are learning English while already fluent in their native language, creating unique challenges in language acquisition.</p>
            <h4 className="font-medium text-yellow-600 mt-3">How our stories adapt:</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>Simplified sentence structures while maintaining natural language</li>
              <li>Enhanced visual representations of concepts</li>
              <li>Consistent formatting of key vocabulary</li>
              <li>Multiple exposures to sight words in different contexts</li>
              <li>Clear connections between images and text</li>
              <li>Optional word translations (in future updates)</li>
              <li>Cultural relevance considerations in stories</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-xl font-semibold mb-2">Visual Processing</h3>
            <p className="mb-2">Visual processing difficulties affect how the brain processes visual information, impacting reading despite normal vision.</p>
            <h4 className="font-medium text-red-600 mt-3">How our stories adapt:</h4>
            <ul className="list-disc ml-5 space-y-1">
              <li>High contrast between text and background</li>
              <li>Larger text size options</li>
              <li>Reduced visual clutter and simplified layouts</li>
              <li>Strategic word highlighting techniques</li>
              <li>Careful spacing of text elements</li>
              <li>Consistent placement of text and images</li>
              <li>Line tracking supports</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Info className="text-blue-500 mt-1 mr-2" size={20} />
            <p className="text-sm text-blue-800">
              <strong>Note for educators:</strong> These adaptations are designed to support diverse learning needs, but every student is unique. We recommend consulting with specialists and individualizing approaches based on specific student requirements. The story generator provides a starting point that can be further customized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningNeedsInfo;