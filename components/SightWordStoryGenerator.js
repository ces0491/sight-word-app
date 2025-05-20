// components/SightWordStoryGenerator.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Book, ArrowLeft, Settings, List, BarChart
} from 'lucide-react';
import AuthDialog from './auth/AuthDialog';

// Import our enhanced components
import ImprovedImageUpload from './ImageUpload';
import LearningConsiderationsPanel from './LearningConsiderationsPanel';
import LearningNeedsInfo from './LearningNeedsInfo';
import StoryGenerator from './StoryGenerator'; // Using the fixed version
import StoryPreview from './StoryPreview'; // Using the fixed version

// Import other utilities and services
import { trackWordUsage } from '../lib/WordAnalytics';

/**
 * Enhanced Sight Word Story Generator with ESLint fixes
 * 
 * Main application component that integrates all the enhanced components
 * and provides a better user experience for story generation.
 */
const SightWordStoryGenerator = () => {
  // Auth state
  const { data: session, status } = useSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Main state management
  const [words, setWords] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [grade, setGrade] = useState(1);
  const [learningNeeds, setLearningNeeds] = useState({
    adhd: false,
    dyslexia: false,
    autism: false,
    esl: false,
    visualProcessing: false,
  });
  
  // Story generation state
  const [includeImages, setIncludeImages] = useState(true);
  const [storyFormat, setStoryFormat] = useState('highlighted');
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  
  // UI state
  const [currentTab, setCurrentTab] = useState('input');
  const [showLearningInfo, setShowLearningInfo] = useState(false);
  const [manualWordInput, setManualWordInput] = useState('');
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Load saved stories on component mount if user is signed in
  useEffect(() => {
    if (session?.user) {
      fetchSavedStories();
    }
  }, [session]);
  
  // Apply dynamic class based on learning needs
  useEffect(() => {
    const body = document.body;
    
    // Clear existing classes
    body.classList.remove(
      'dyslexia-enabled', 
      'adhd-enabled', 
      'visual-processing-enabled', 
      'autism-enabled', 
      'esl-enabled'
    );
    
    // Add classes based on active learning needs
    if (learningNeeds.dyslexia) body.classList.add('dyslexia-enabled');
    if (learningNeeds.adhd) body.classList.add('adhd-enabled');
    if (learningNeeds.visualProcessing) body.classList.add('visual-processing-enabled');
    if (learningNeeds.autism) body.classList.add('autism-enabled');
    if (learningNeeds.esl) body.classList.add('esl-enabled');
    
    // Add grade level class
    body.classList.remove('grade-k', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5');
    body.classList.add(`grade-${grade === 0 ? 'k' : grade}`);
    
  }, [learningNeeds, grade]);
  
  /**
   * Fetch saved stories from the database
   */
  const fetchSavedStories = async () => {
    try {
      setIsLoadingStories(true);
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setSavedStories(data);
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoadingStories(false);
    }
  };
  
  /**
   * Handle manual word input
   */
  const handleManualWordAdd = () => {
    if (manualWordInput.trim()) {
      const newWords = manualWordInput
        .split(/[\s,]+/)
        .filter(word => word.trim().length > 0)
        .map(word => word.trim().toLowerCase());
      
      setWords([...new Set([...words, ...newWords])]);
      setManualWordInput('');
    }
  };
  
  /**
   * Handle file upload for word lists
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const newWords = fileContent
        .split(/[\s,\n]+/)
        .filter(word => word.trim().length > 0)
        .map(word => word.trim().toLowerCase());
      
      setWords([...new Set([...words, ...newWords])]);
    };
    reader.readAsText(file);
  };
  
  /**
   * Handle words detected from OCR
   */
  const handleWordsDetected = (detectedWords) => {
    if (detectedWords && detectedWords.length > 0) {
      setWords([...new Set([...words, ...detectedWords])]);
    }
  };
  
  /**
   * Handle story generation
   */
  const handleGenerateStory = () => {
    // Check if words array is valid
    if (!words || !Array.isArray(words) || words.length === 0) {
      console.error('Cannot generate story: no words available');
      return;
    }
  
    // Set the generating state to true to show loading indicator
    setIsGeneratingStory(true);
  
    try {
      // Import the story generation function directly
      const { generateStory } = require('../lib/storyGeneration');
    
      // Generate the story
      const storyData = generateStory(words, grade, learningNeeds);
      console.log('Story generated:', storyData);
    
      // Create the full story object with all metadata
      const story = {
        id: Date.now(),
        title: storyData.title || 'My Story',
        content: storyData.content || ['Once upon a time...'],
        words: [...words],
        usedWords: storyData.usedWords || words,
        format: storyFormat,
        includeImages,
        grade,
        learningNeeds: {...learningNeeds},
        timestamp: new Date().toISOString()
      };
    
      // Set the generated story in state
      setGeneratedStory(story);
    
      // Switch to preview tab
      setCurrentTab('preview');
    
      // Track word usage for analytics
      if (session?.user) {
        trackWordUsage(words, grade).catch(err => 
          console.error('Error tracking word usage:', err)
        );
      }
    } catch (error) {
      console.error('Error generating story:', error);
      alert('There was an error generating your story. Please try again.');
    } finally {
      // Always set generating state back to false
      setIsGeneratingStory(false);
    }
  };
  
  /**
   * Save the current story
   */
  const saveStory = async () => {
    if (!generatedStory) return;
    
    // If user is not logged in, prompt for authentication
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      setIsSavingStory(true);
      
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedStory),
      });
      
      if (response.ok) {
        const savedStory = await response.json();
        setSavedStories([savedStory, ...savedStories]);
        alert("Story saved successfully!");
      } else {
        console.error('Failed to save story');
        alert("Failed to save story. Please try again.");
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert("An error occurred while saving the story.");
    } finally {
      setIsSavingStory(false);
    }
  };
  
  /**
   * Share a story with someone
   */
  const shareStory = async () => {
    if (!shareEmail.trim() || !generatedStory) return;
    
    try {
      setIsSharing(true);
      
      const response = await fetch(`/api/stories/${generatedStory.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: shareEmail.trim(),
        }),
      });
      
      if (response.ok) {
        alert(`Story shared with ${shareEmail} successfully!`);
        setShareEmail('');
        setShowShareDialog(false);
      } else {
        alert("Failed to share story. Please try again.");
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      alert("An error occurred while sharing the story.");
    } finally {
      setIsSharing(false);
    }
  };
  
  /**
   * Delete a word from the list
   */
  const deleteWord = (indexToDelete) => {
    setWords(words.filter((_, index) => index !== indexToDelete));
  };
  
  /**
   * Reset the form
   */
  const resetForm = () => {
    setWords([]);
    setInputMethod('manual');
    setManualWordInput('');
  };
  
  /**
   * Print the current story
   */
  const printStory = () => {
    window.print();
  };
  
  /**
   * Download story as PDF (placeholder)
   */
  const downloadStory = () => {
    alert("PDF download will be implemented in a future update.");
    // In a full implementation, you would use a library like jsPDF
    // to generate and download a PDF of the story
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Book className="mr-2" />
            Mason&apos;s Sight Word Story Generator
          </h1>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <button 
              className={`px-3 py-2 rounded-md ${currentTab === 'input' ? 'bg-white text-blue-700 font-medium' : 'bg-blue-800 hover:bg-blue-900'}`}
              onClick={() => setCurrentTab('input')}
            >
              Create Story
            </button>
            <button 
              className={`px-3 py-2 rounded-md ${currentTab === 'preview' ? 'bg-white text-blue-700 font-medium' : 'bg-blue-800 hover:bg-blue-900'}`}
              onClick={() => setCurrentTab('preview')}
              disabled={!generatedStory}
              aria-disabled={!generatedStory}
            >
              Preview
            </button>
            <button 
              className={`px-3 py-2 rounded-md ${currentTab === 'saved' ? 'bg-white text-blue-700 font-medium' : 'bg-blue-800 hover:bg-blue-900'}`}
              onClick={() => {
                setCurrentTab('saved');
                if (session?.user && !isLoadingStories) {
                  fetchSavedStories();
                }
              }}
            >
              Saved Stories
            </button>
            {session?.user && (
              <button 
                className={`hidden md:flex items-center px-3 py-2 rounded-md ${currentTab === 'analytics' ? 'bg-white text-blue-700 font-medium' : 'bg-blue-800 hover:bg-blue-900'}`}
                onClick={() => setCurrentTab('analytics')}
              >
                <BarChart size={18} className="mr-1" />
                Analytics
              </button>
            )}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main id="main-content" className="flex-grow container mx-auto p-4 md:p-6">
        {/* Input Panel */}
        {currentTab === 'input' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Words Input Panel */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Sight Words</h2>
              
              {/* Input Type Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'manual' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('manual')}
                >
                  <List size={18} /> Manual Entry
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'file' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('file')}
                >
                  <ArrowLeft size={18} /> Upload File
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'image' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('image')}
                >
                  <Settings size={18} /> Take Picture
                </button>
              </div>
              
              {/* Manual Input Form */}
              {inputMethod === 'manual' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter words (separated by spaces or commas)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualWordInput}
                      onChange={(e) => setManualWordInput(e.target.value)}
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                      placeholder="e.g., cat dog house"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualWordAdd();
                        }
                      }}
                    />
                    <button 
                      onClick={handleManualWordAdd}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              
              {/* File Upload */}
              {inputMethod === 'file' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload a file with words (.txt, .csv)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".txt,.csv"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className="mt-2 block text-sm font-medium text-gray-700">
                        Click to upload a file
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Image Upload / OCR */}
              {inputMethod === 'image' && (
                <div className="mb-6">
                  <ImprovedImageUpload 
                    onWordsDetected={handleWordsDetected}
                    grade={grade}
                  />
                </div>
              )}
              
              {/* Word Chips */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Current Words ({words.length})</h3>
                  {words.length > 0 && (
                    <button 
                      onClick={resetForm}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {words.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {words.map((word, index) => (
                      <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                        <span className="mr-2 text-blue-800">{word}</span>
                        <button 
                          onClick={() => deleteWord(index)}
                          className="text-blue-700 hover:text-blue-900"
                          aria-label={`Remove word ${word}`}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No words added yet.</p>
                )}
              </div>
              
              {/* Story Generator Component */}
              <StoryGenerator
                words={words}
                grade={grade}
                learningNeeds={learningNeeds}
                includeImages={includeImages}
                storyFormat={storyFormat}
                onGenerateStory={handleGenerateStory}
                isGeneratingStory={isGeneratingStory}
              />
            </div>
            
            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Story Settings</h2>
              
              {/* Grade Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                >
                  <option value={0}>Kindergarten</option>
                  <option value={1}>Grade 1</option>
                  <option value={2}>Grade 2</option>
                  <option value={3}>Grade 3</option>
                  <option value={4}>Grade 4</option>
                  <option value={5}>Grade 5</option>
                </select>
              </div>
              
              {/* Learning Needs */}
              <div className="mb-6">
                <LearningConsiderationsPanel
                  learningNeeds={learningNeeds}
                  setLearningNeeds={setLearningNeeds}
                  onInfoClick={() => setShowLearningInfo(true)}
                />
              </div>
              
              {/* Story Format Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="radio"
                      value="highlighted"
                      checked={storyFormat === 'highlighted'}
                      onChange={() => setStoryFormat('highlighted')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm text-gray-700">Highlighted Words</span>
                      <div className="text-xs text-gray-500 mt-1">Words appear with colored background</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="radio"
                      value="bold"
                      checked={storyFormat === 'bold'}
                      onChange={() => setStoryFormat('bold')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm text-gray-700">Bold Words</span>
                      <div className="text-xs text-gray-500 mt-1">Words appear in <b>bold text</b></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="radio"
                      value="underlined"
                      checked={storyFormat === 'underlined'}
                      onChange={() => setStoryFormat('underlined')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm text-gray-700">Underlined Words</span>
                      <div className="text-xs text-gray-500 mt-1">Words appear with <u>underline</u></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="radio"
                      value="normal"
                      checked={storyFormat === 'normal'}
                      onChange={() => setStoryFormat('normal')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-2">
                      <span className="text-sm text-gray-700">Normal Text (No Formatting)</span>
                      <div className="text-xs text-gray-500 mt-1">Words appear as regular text</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Include Images */}
              <div className="mb-6">
                <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id="includeImages"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-2">
                    <span className="text-sm text-gray-700">Include Illustrations</span>
                    <div className="text-xs text-gray-500 mt-1">Generate images for each sentence</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Story Preview Panel */}
        {currentTab === 'preview' && generatedStory && (
          <StoryPreview
            story={generatedStory}
            onSave={saveStory}
            onShare={() => setShowShareDialog(true)}
            onPrint={printStory}
            onDownload={downloadStory}
            isAuthenticated={!!session?.user}
            isSaving={isSavingStory}
          />
        )}
        
        {/* Saved Stories Panel */}
        {currentTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Saved Stories</h2>
            
            {!session?.user ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sign in to view your saved stories</h3>
                <p className="text-gray-500 mb-4">You need to be logged in to save and access your stories.</p>
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            ) : isLoadingStories ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500">Loading your stories...</p>
              </div>
            ) : savedStories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No stories yet</h3>
                <p className="text-gray-500 mb-4">You haven&apos;t saved any stories. Generate and save a story to see it here.</p>
                <button
                  onClick={() => setCurrentTab('input')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create a Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedStories.map((story) => (
                  <div key={story._id || story.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">{story.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(story.createdAt || story.timestamp).toLocaleDateString()} • 
                      {story.words.length} words • Grade {story.grade}
                    </p>
                    <p className="text-gray-700 line-clamp-2 mb-2">
                      {story.content[0]}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {story.words.slice(0, 3).map((word, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                            {word}
                          </span>
                        ))}
                        {story.words.length > 3 && (
                          <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                            +{story.words.length - 3} more
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setGeneratedStory(story);
                          setCurrentTab('preview');
                        }}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Analytics Panel Placeholder */}
        {currentTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Word Usage Analytics</h2>
            <p className="text-center text-gray-600">Analytics dashboard would be displayed here.</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Sight Word Story Generator • An educational tool for teachers and students</p>
        </div>
      </footer>
      
      {/* Authentication Dialog */}
      {showAuthDialog && (
        <AuthDialog onClose={() => setShowAuthDialog(false)} onSuccess={() => {
          setShowAuthDialog(false);
          // If user was trying to save a story, save it after login
          if (generatedStory && currentTab === 'preview') {
            saveStory();
          }
        }} />
      )}
      
      {/* Learning Needs Info Modal */}
      <LearningNeedsInfo 
        isOpen={showLearningInfo} 
        onClose={() => setShowLearningInfo(false)} 
      />
      
      {/* Share Dialog Placeholder */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Share Story</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="example@school.edu"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={shareStory}
                disabled={!shareEmail.trim() || isSharing}
                className={`px-4 py-2 rounded-md ${
                  !shareEmail.trim() || isSharing ? 'bg-blue-300 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SightWordStoryGenerator;