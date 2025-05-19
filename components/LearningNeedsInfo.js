// components/LearningNeedsInfo.js
import React from 'react';
import { Info, X, BookOpen, Brain, Layers, Globe, Eye } from 'lucide-react';

/**
 * Redesigned Learning Needs Info Modal with improved readability
 * 
 * Features:
 * - Higher contrast colors
 * - Larger, more readable fonts
 * - Better organized information
 * - More visual examples
 * - Clearer section headers
 */
const LearningNeedsInfo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-800">Learning Considerations</h2>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-lg text-gray-800 mb-5">
            Our Sight Word Story Generator provides specialized adaptations for different learning needs.
            These adaptations help make reading more accessible and enjoyable for all students.
          </p>
          
          <div className="space-y-8">
            {/* ADHD Section */}
            <section className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
              <div className="flex items-start p-5">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Brain className="h-8 w-8 text-blue-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-blue-900 mb-3">ADHD</h3>
                  <p className="text-blue-900 font-medium mb-4">
                    Attention-Deficit/Hyperactivity Disorder affects a student's ability to maintain focus, control impulses, and regulate activity levels.
                  </p>
                  
                  <h4 className="font-bold text-blue-800 mb-2">How our stories adapt:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">1</span>
                        <span className="text-blue-800">Shorter, more focused story segments to maintain attention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">2</span>
                        <span className="text-blue-800">Enhanced visual formatting with high-contrast highlighting of target words</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">3</span>
                        <span className="text-blue-800">Strategic placement of illustrations to re-engage attention</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">4</span>
                        <span className="text-blue-800">Reduced visual distractions in the story presentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">5</span>
                        <span className="text-blue-800">More frequent visual supports to maintain engagement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold">6</span>
                        <span className="text-blue-800">Simplified page layouts to minimize distractions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">Example adaptation:</p>
                    <div className="mt-2 border border-blue-100 p-3 rounded bg-blue-50">
                      <p className="text-blue-800 font-medium">Instead of a long paragraph, content is broken into shorter, focused sentences with visual breaks.</p>
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-blue-600">Original:</span>
                        <span className="ml-2 text-gray-700">Sam went to the park and saw a big dog and then played on the swings and after that got ice cream.</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-blue-600">Adapted:</span>
                        <div className="ml-2 space-y-1">
                          <p className="text-blue-800">Sam went to the park.</p>
                          <p className="text-blue-800">Sam saw a <span className="bg-yellow-200 px-1 py-0.5 rounded">big</span> dog.</p>
                          <p className="text-blue-800">Then Sam played on the swings.</p>
                          <p className="text-blue-800">After that, Sam got ice cream.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Dyslexia Section */}
            <section className="rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 overflow-hidden">
              <div className="flex items-start p-5">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-200 rounded-full">
                    <BookOpen className="h-8 w-8 text-purple-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-purple-900 mb-3">Dyslexia</h3>
                  <p className="text-purple-900 font-medium mb-4">
                    Dyslexia is a learning disorder that involves difficulty reading due to problems identifying speech sounds and learning how they relate to letters and words.
                  </p>
                  
                  <h4 className="font-bold text-purple-800 mb-2">How our stories adapt:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">1</span>
                        <span className="text-purple-800">Increased spacing between words and lines for better visual processing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">2</span>
                        <span className="text-purple-800">Option to use dyslexia-friendly fonts (Comic Neue)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">3</span>
                        <span className="text-purple-800">Multiple encoding options with visual and textual cues</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">4</span>
                        <span className="text-purple-800">Color highlighting for better word recognition and tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">5</span>
                        <span className="text-purple-800">Consistent placement of text elements across pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold">6</span>
                        <span className="text-purple-800">Control over text size and contrast</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900 font-medium">Example adaptation:</p>
                    <div className="mt-2 border border-purple-100 p-3 rounded bg-purple-50">
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-purple-600">Original:</span>
                        <span className="ml-2 text-gray-700" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.4' }}>
                          The little dog ran to the big red ball and started playing in the park.
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <span className="font-bold text-purple-600">Adapted:</span>
                        <span className="ml-2 text-purple-800 font-comic" style={{ fontFamily: 'Comic Neue, cursive', fontSize: '16px', lineHeight: '2', letterSpacing: '0.5px', wordSpacing: '4px' }}>
                          The <span className="bg-purple-200 px-1 rounded">little</span> dog ran to the <span className="bg-purple-200 px-1 rounded">big</span> red ball and started <span className="bg-purple-200 px-1 rounded">playing</span> in the park.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Autism Section */}
            <section className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 overflow-hidden">
              <div className="flex items-start p-5">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-200 rounded-full">
                    <Layers className="h-8 w-8 text-green-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-green-900 mb-3">Autism Spectrum</h3>
                  <p className="text-green-900 font-medium mb-4">
                    Autism spectrum disorder affects how people perceive and socialize with others, causing challenges in social interaction and communication.
                  </p>
                  
                  <h4 className="font-bold text-green-800 mb-2">How our stories adapt:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">1</span>
                        <span className="text-green-800">Predictable, structured story formats for easier comprehension</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">2</span>
                        <span className="text-green-800">Clear visual supports paired with text</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">3</span>
                        <span className="text-green-800">Concrete language with literal meanings</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">4</span>
                        <span className="text-green-800">Consistent formatting from story to story</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">5</span>
                        <span className="text-green-800">Reduced sensory overload with simplified illustrations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold">6</span>
                        <span className="text-green-800">Clear beginning, middle, and end structure</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900 font-medium">Example adaptation:</p>
                    <div className="mt-2 border border-green-100 p-3 rounded bg-green-50">
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-green-600">Original:</span>
                        <span className="ml-2 text-gray-700">
                          Casey felt butterflies in her stomach as she walked into the classroom full of unfamiliar faces.
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <span className="font-bold text-green-600">Adapted:</span>
                        <span className="ml-2 text-green-800">
                          Casey felt nervous on the first day of school. She walked into the classroom. She saw many new students. Casey took a deep breath and found her seat.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* ESL Section */}
            <section className="rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 overflow-hidden">
              <div className="flex items-start p-5">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-200 rounded-full">
                    <Globe className="h-8 w-8 text-yellow-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-yellow-900 mb-3">English as Second Language</h3>
                  <p className="text-yellow-900 font-medium mb-4">
                    ESL students are learning English while already fluent in another language, creating unique challenges in vocabulary acquisition and comprehension.
                  </p>
                  
                  <h4 className="font-bold text-yellow-800 mb-2">How our stories adapt:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">1</span>
                        <span className="text-yellow-800">Simplified sentence structures for easier comprehension</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">2</span>
                        <span className="text-yellow-800">Visual supports paired with all key vocabulary</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">3</span>
                        <span className="text-yellow-800">Emphasis on high-frequency sight words</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">4</span>
                        <span className="text-yellow-800">Consistent formatting to build familiarity</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">5</span>
                        <span className="text-yellow-800">Option for word translations on hover (in development)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-yellow-600 text-white flex-shrink-0 flex items-center justify-center font-bold">6</span>
                        <span className="text-yellow-800">Controlled vocabulary progression</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-900 font-medium">Example adaptation:</p>
                    <div className="mt-2 border border-yellow-100 p-3 rounded bg-yellow-50">
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-yellow-600">Original:</span>
                        <span className="ml-2 text-gray-700">
                          The curious child wandered through the museum, marveling at the ancient artifacts.
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <span className="font-bold text-yellow-600">Adapted:</span>
                        <span className="ml-2 text-yellow-800">
                          The child walked through the museum. 
                          The child looked at the old things. 
                          The child said, "These are amazing!"
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Visual Processing Section */}
            <section className="rounded-xl bg-gradient-to-r from-red-50 to-red-100 overflow-hidden">
              <div className="flex items-start p-5">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-200 rounded-full">
                    <Eye className="h-8 w-8 text-red-700" />
                  </div>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-red-900 mb-3">Visual Processing</h3>
                  <p className="text-red-900 font-medium mb-4">
                    Visual processing difficulties affect how the brain processes visual information, impacting a student's ability to interpret what they see.
                  </p>
                  
                  <h4 className="font-bold text-red-800 mb-2">How our stories adapt:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">1</span>
                        <span className="text-red-800">High contrast between text and background</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">2</span>
                        <span className="text-red-800">Larger text options for better visibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">3</span>
                        <span className="text-red-800">Clean, uncluttered layouts to reduce visual noise</span>
                      </li>
                    </ul>
                    <ul className="list-none space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">4</span>
                        <span className="text-red-800">Strategic word highlighting with customizable colors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">5</span>
                        <span className="text-red-800">Consistent positioning of elements across pages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white flex-shrink-0 flex items-center justify-center font-bold">6</span>
                        <span className="text-red-800">Optimized spacing between letters, words, and lines</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 font-medium">Example adaptation:</p>
                    <div className="mt-2 border border-red-100 p-3 rounded bg-red-50">
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-red-600">Original:</span>
                        <span className="ml-2 text-gray-600 bg-gray-100 p-2 rounded text-sm">
                          The cat jumped onto the table. It knocked over the glass of water.
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <span className="font-bold text-red-600">Adapted:</span>
                        <span className="ml-2 text-black bg-white p-2 rounded text-lg font-bold tracking-wide leading-relaxed">
                          The <span className="bg-orange-300 px-1 rounded">cat</span> jumped onto the <span className="bg-orange-300 px-1 rounded">table</span>. 
                          <br />
                          It knocked over the <span className="bg-orange-300 px-1 rounded">glass</span> of water.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Footer Note */}
          <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <Info className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={24} />
              <div>
                <p className="text-blue-900 font-bold">Note for educators:</p>
                <p className="text-blue-800 mt-1">
                  These adaptations are designed to support diverse learning needs, but every student is unique. We recommend consulting with specialists and individualizing approaches based on specific student requirements. The story generator provides a starting point that can be further customized.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningNeedsInfo;