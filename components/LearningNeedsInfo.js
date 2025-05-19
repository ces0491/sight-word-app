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
          
          {/* Rest of the component remains the same, with apostrophes fixed */}
          {/* ... */}
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