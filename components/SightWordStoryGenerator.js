// SightWordStoryGenerator.js - Updated with real OCR and SVG image generation
import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { 
  Camera, FileUp, Edit3, Save, Book, Printer, BookOpen, 
  Zap, List, UserCheck, PlayCircle, Download, 
  Share2, Info, LineChart, User, LogIn, BarChart
} from 'lucide-react';
import Image from 'next/image';

// Import our custom components and utilities
import LearningNeedsInfo from './LearningNeedsInfo';
import AuthDialog from './auth/AuthDialog';
import { performOCR } from '../lib/ocr';
import { generateSVGIllustration, svgToDataURL } from '../lib/imageGeneration';

const SightWordStoryGenerator = () => {
  // Auth state
  const { data: session, status } = useSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // State management
  const [words, setWords] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [previewImage, setPreviewImage] = useState(null);
  const [grade, setGrade] = useState(1);
  const [learningNeeds, setLearningNeeds] = useState({
    adhd: false,
    dyslexia: false,
    autism: false,
    esl: false,
    visualProcessing: false,
  });
  const [includeImages, setIncludeImages] = useState(true);
  const [storyFormat, setStoryFormat] = useState('highlighted');
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [showInputPanel, setShowInputPanel] = useState(true);
  const [manualWordInput, setManualWordInput] = useState('');
  const [currentTab, setCurrentTab] = useState('input');
  const [showLearningInfo, setShowLearningInfo] = useState(false);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [wordAnalytics, setWordAnalytics] = useState(null);
  const [aiIllustrations, setAiIllustrations] = useState({});
  const [isGeneratingImages, setIsGeneratingImages] = useState({});
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  
  // Load saved stories on component mount if user is signed in
  useEffect(() => {
    if (session?.user) {
      fetchSavedStories();
    }
  }, [session]);

  // Apply adjustments based on learning needs
  useEffect(() => {
    const root = document.documentElement;
    
    // Reset to defaults
    root.style.setProperty('--font-size-base', '1rem');
    root.style.setProperty('--line-spacing', '1.5');
    root.style.setProperty('--word-spacing', 'normal');
    root.style.setProperty('--highlight-color', '#FFEB3B');
    
    // Apply adjustments based on learning needs
    if (learningNeeds.dyslexia) {
      root.style.setProperty('--font-size-base', '1.2rem');
      root.style.setProperty('--line-spacing', '2');
      root.style.setProperty('--word-spacing', '0.2em');
    }
    
    if (learningNeeds.visualProcessing) {
      root.style.setProperty('--highlight-color', '#FFA500');
    }
    
  }, [learningNeeds]);

  // Fetch saved stories from the database
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
  
  // Handle manual word input
  const handleManualWordAdd = () => {
    if (manualWordInput.trim()) {
      const newWords = manualWordInput
        .split(/[\s,]+/)
        .filter(word => word.trim().length > 0)
        .map(word => word.trim().toLowerCase());
      
      setWords([...words, ...newWords]);
      setManualWordInput('');
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const newWords = fileContent
        .split(/[\s,]+/)
        .filter(word => word.trim().length > 0)
        .map(word => word.trim().toLowerCase());
      
      setWords([...words, ...newWords]);
    };
    reader.readAsText(file);
  };
  
  // Handle image upload for OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsProcessingOCR(true);
      setOcrError(null);
      
      // Create preview for display
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      // Process image with OCR
      const result = await performOCR(file);
      
      if (result.success) {
        // Add the extracted words to our list
        if (result.words.length > 0) {
          setWords([...words, ...result.words]);
        } else {
          setOcrError("No words detected in the image. Try a clearer image or different angle.");
        }
      } else {
        setOcrError(result.error || "OCR processing failed. Please try again.");
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setOcrError("An error occurred while processing the image.");
    } finally {
      setIsProcessingOCR(false);
    }
  };
  
  // Track word usage for analytics
  const trackWordUsage = async (wordsUsed, storyGrade) => {
    if (!wordsUsed.length) return;
    
    try {
      await fetch('/api/analytics/trackWords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: wordsUsed,
          grade: storyGrade
        }),
      });
    } catch (error) {
      console.error('Error tracking word usage:', error);
    }
  };
  
  // Generate a story from the words
  const generateStory = () => {
    if (words.length === 0) return;
    
    setIsGeneratingStory(true);
    
    // In a production app, this would call an API to generate the story
    setTimeout(() => {
      // Example story generation logic
      const storyTypes = [
        { title: "A Day at School", template: "SUBJECT went to school. SUBJECT saw PERSON. They read a OBJECT together. PERSON said, \"I like this ADJECTIVE OBJECT!\" After school, they went to the PLACE. It was a ADJECTIVE day!" },
        { title: "The Adventure", template: "One day, SUBJECT went to the PLACE. SUBJECT found a ADJECTIVE OBJECT. \"Look at this!\" SUBJECT said to PERSON. They played with the OBJECT all day. It was ADJECTIVE!" },
        { title: "My Pet", template: "SUBJECT has a ADJECTIVE pet. It is a ANIMAL. The ANIMAL likes to play in the PLACE. \"Come here!\" says SUBJECT. PERSON helps SUBJECT feed the ANIMAL. They are ADJECTIVE." }
      ];
      
      // Categorize words to help with story structure
      const subjects = words.filter(w => ['i', 'we', 'he', 'she', 'they', 'my', 'our'].includes(w.toLowerCase()));
      const objects = words.filter(w => ['book', 'ball', 'toy', 'car', 'dog', 'cat', 'house', 'school', 'party'].includes(w.toLowerCase()));
      const adjectives = words.filter(w => ['big', 'small', 'happy', 'sad', 'good', 'bad', 'new', 'old', 'pretty', 'funny'].includes(w.toLowerCase()));
      const places = words.filter(w => ['house', 'school', 'park', 'home', 'garden', 'shop', 'store'].includes(w.toLowerCase()));
      const persons = words.filter(w => ['friend', 'teacher', 'mom', 'dad', 'brother', 'sister', 'girl', 'boy'].includes(w.toLowerCase()));
      const animals = words.filter(w => ['dog', 'cat', 'bird', 'fish', 'rabbit'].includes(w.toLowerCase()));
      
      // Pick a random story template
      const storyType = storyTypes[Math.floor(Math.random() * storyTypes.length)];
      
      // Fill in the template with words, or use defaults if we don't have matching words
      let storyText = storyType.template;
      const selectedSubject = subjects.length > 0 ? subjects[Math.floor(Math.random() * subjects.length)] : 'I';
      storyText = storyText.replace(/SUBJECT/g, selectedSubject);
      storyText = storyText.replace(/OBJECT/g, objects.length > 0 ? objects[Math.floor(Math.random() * objects.length)] : 'toy');
      storyText = storyText.replace(/ADJECTIVE/g, adjectives.length > 0 ? adjectives[Math.floor(Math.random() * adjectives.length)] : 'nice');
      storyText = storyText.replace(/PLACE/g, places.length > 0 ? places[Math.floor(Math.random() * places.length)] : 'park');
      storyText = storyText.replace(/PERSON/g, persons.length > 0 ? persons[Math.floor(Math.random() * persons.length)] : 'friend');
      storyText = storyText.replace(/ANIMAL/g, animals.length > 0 ? animals[Math.floor(Math.random() * animals.length)] : 'pet');
      
      // Fix grammar based on subject
      storyText = storyText.replace(/I has /g, "I have ");
      storyText = storyText.replace(/I is /g, "I am ");
      storyText = storyText.replace(/We has /g, "We have ");
      storyText = storyText.replace(/We is /g, "We are ");
      
      // Split into sentences for better display
      const sentences = storyText.match(/[^\.!\?]+[\.!\?]+/g) || [storyText];
      
      // Create an object with all story data
      const story = {
        id: Date.now(),
        title: storyType.title,
        content: sentences,
        words: [...words],
        format: storyFormat,
        includeImages,
        grade,
        learningNeeds: {...learningNeeds},
        timestamp: new Date().toISOString()
      };
      
      setGeneratedStory(story);
      setCurrentTab('preview');
      setIsGeneratingStory(false);
      
      // Track word usage for analytics
      if (session?.user) {
        trackWordUsage(words, grade);
      }
      
      // Pre-generate illustrations for each sentence if images are enabled
      if (includeImages) {
        sentences.forEach(sentence => {
          getIllustrationForSentence(sentence);
        });
      }
    }, 2000);
  };
  
  // Save the current story
  const saveStory = async () => {
    if (!generatedStory) return;
    
    // If user is not logged in, prompt for authentication
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      setIsSavingStory(true);
      
      // In a real app, we would save to the database
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
  
  // Share a story with someone
  const shareStory = async (storyId) => {
    if (!shareEmail.trim() || !storyId) return;
    
    try {
      setIsSharing(true);
      
      const response = await fetch(`/api/stories/${storyId}/share`, {
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
  
  // Delete a word from the list
  const deleteWord = (indexToDelete) => {
    setWords(words.filter((_, index) => index !== indexToDelete));
  };
  
  // Reset the form
  const resetForm = () => {
    setWords([]);
    setInputMethod('manual');
    setPreviewImage(null);
    setManualWordInput('');
    setOcrError(null);
  };
  
  // Generate an illustration based on a sentence using our SVG generator
  const getIllustrationForSentence = async (sentence) => {
    // Check if we already have an illustration for this sentence
    if (aiIllustrations[sentence]) {
      return aiIllustrations[sentence];
    }
    
    // Mark this sentence as loading an illustration
    setIsGeneratingImages(prev => ({ ...prev, [sentence]: true }));
    
    try {
      // Generate SVG illustration from the sentence content
      const svgIllustration = generateSVGIllustration(sentence);
      
      // Convert SVG to a data URL for display
      const imageUrl = svgToDataURL(svgIllustration);
      
      // Save the illustration for this sentence
      setAiIllustrations(prev => ({ ...prev, [sentence]: imageUrl }));
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsGeneratingImages(prev => ({ ...prev, [sentence]: false }));
      
      // Fallback to a default image
      return "https://picsum.photos/seed/fallback/400/240";
    }
  };
  
  // Fetch word usage analytics
  const fetchWordAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/wordUsage');
      if (response.ok) {
        const data = await response.json();
        setWordAnalytics(data);
      } else {
        console.error('Failed to fetch word analytics');
      }
    } catch (error) {
      console.error('Error fetching word analytics:', error);
    }
  };
  
  // Highlighted text rendering
  const renderHighlightedText = (text) => {
    return words.reduce((acc, word) => {
      // Create a regular expression that matches the whole word (with word boundaries)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return acc.replace(regex, `<span class="highlight">$&</span>`);
    }, text);
  };
  
  // Format the displayed text based on selected format
  const formatText = (sentence) => {
    switch (storyFormat) {
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sight Word Story Generator</h1>
          <nav className="flex items-center space-x-4">
            <button 
              className={`px-3 py-1 rounded-md ${currentTab === 'input' ? 'bg-white text-blue-600' : 'bg-blue-700'}`}
              onClick={() => setCurrentTab('input')}
            >
              Create Story
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${currentTab === 'preview' ? 'bg-white text-blue-600' : 'bg-blue-700'}`}
              onClick={() => setCurrentTab('preview')}
              disabled={!generatedStory}
            >
              Preview
            </button>
            <button 
              className={`px-3 py-1 rounded-md ${currentTab === 'saved' ? 'bg-white text-blue-600' : 'bg-blue-700'}`}
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
                className={`px-3 py-1 rounded-md ${currentTab === 'analytics' ? 'bg-white text-blue-600' : 'bg-blue-700'}`}
                onClick={() => {
                  setCurrentTab('analytics');
                  fetchWordAnalytics();
                }}
              >
                <BarChart size={18} className="inline-block mr-1" />
                Analytics
              </button>
            )}
            <div className="ml-2 border-l pl-2 flex items-center">
              {session?.user ? (
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  <span className="text-sm mr-2">{session.user.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="flex items-center text-sm"
                >
                  <LogIn size={16} className="mr-1" />
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {currentTab === 'input' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Sight Words</h2>
              
              {/* Input Type Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('manual')}
                >
                  <Edit3 size={18} /> Manual Entry
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('file')}
                >
                  <FileUp size={18} /> Upload File
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setInputMethod('image')}
                >
                  <Camera size={18} /> Take Picture
                </button>
              </div>
              
              {/* Manual Input */}
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
                      className="bg-blue-600 text-white px-3 py-2 rounded-md"
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
                      <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-700">
                        Click to upload a file
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Image Upload/Camera */}
              {inputMethod === 'image' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Take a picture or upload an image of sight words
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    {previewImage ? (
                      <div className="space-y-4">
                        <Image 
                          src={previewImage} 
                          alt="Preview" 
                          className="max-h-40 mx-auto" 
                          width={200} 
                          height={160}
                          style={{ objectFit: 'contain' }}
                        />
                        {isProcessingOCR ? (
                          <div className="text-center">
                            <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <p className="mt-2 text-sm text-gray-500">Processing image...</p>
                          </div>
                        ) : (
                          <>
                            {ocrError && (
                              <div className="text-red-500 text-sm">{ocrError}</div>
                            )}
                            <button 
                              onClick={() => {
                                setPreviewImage(null);
                                setOcrError(null);
                              }}
                              className="text-red-600 text-sm font-medium"
                            >
                              Remove image
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          capture="environment"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-700">
                            Click to take a picture or upload an image
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Word Chips */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Current Words ({words.length})</h3>
                  {words.length > 0 && (
                    <button 
                      onClick={resetForm}
                      className="text-sm text-red-600"
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
              
              {/* Generate Button */}
              <button
                onClick={generateStory}
                disabled={words.length === 0 || isGeneratingStory}
                className={`w-full py-3 rounded-md flex items-center justify-center gap-2 
                  ${words.length === 0 || isGeneratingStory 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {isGeneratingStory ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Generate Story
                  </>
                )}
              </button>
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Considerations
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowLearningInfo(true)}
                    className="text-blue-600 text-sm flex items-center"
                  >
                    <Info size={16} className="mr-1" /> Learn more
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adhd"
                      checked={learningNeeds.adhd}
                      onChange={(e) => setLearningNeeds({...learningNeeds, adhd: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="adhd" className="ml-2 text-sm text-gray-700">ADHD</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dyslexia"
                      checked={learningNeeds.dyslexia}
                      onChange={(e) => setLearningNeeds({...learningNeeds, dyslexia: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="dyslexia" className="ml-2 text-sm text-gray-700">Dyslexia</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autism"
                      checked={learningNeeds.autism}
                      onChange={(e) => setLearningNeeds({...learningNeeds, autism: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autism" className="ml-2 text-sm text-gray-700">Autism Spectrum</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="esl"
                      checked={learningNeeds.esl}
                      onChange={(e) => setLearningNeeds({...learningNeeds, esl: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="esl" className="ml-2 text-sm text-gray-700">English as Second Language</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="visualProcessing"
                      checked={learningNeeds.visualProcessing}
                      onChange={(e) => setLearningNeeds({...learningNeeds, visualProcessing: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="visualProcessing" className="ml-2 text-sm text-gray-700">Visual Processing</label>
                  </div>
                </div>
              </div>
              
              {/* Story Format Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Format
                </label>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="highlighted"
                      checked={storyFormat === 'highlighted'}
                      onChange={() => setStoryFormat('highlighted')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Highlighted Words</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="bold"
                      checked={storyFormat === 'bold'}
                      onChange={() => setStoryFormat('bold')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Bold Words</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="underlined"
                      checked={storyFormat === 'underlined'}
                      onChange={() => setStoryFormat('underlined')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Underlined Words</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="normal"
                      checked={storyFormat === 'normal'}
                      onChange={() => setStoryFormat('normal')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Normal Text (No Formatting)</span>
                  </label>
                </div>
              </div>
              
              {/* Include Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Elements
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeImages"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">Include Illustrations</label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Story Preview Panel */}
        {currentTab === 'preview' && generatedStory && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Story preview content remains the same */}
            {/* ... existing code ... */}
          </div>
        )}
        
        {/* Saved Stories Panel */}
        {currentTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Saved stories panel content remains the same */}
            {/* ... existing code ... */}
          </div>
        )}
        
        {/* Analytics Panel */}
        {currentTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Analytics panel content remains the same */}
            {/* ... existing code ... */}
          </div>
        )}
      </main>
      
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
      
      {/* Share Dialog */}
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => shareStory(generatedStory.id)}
                disabled={!shareEmail.trim() || isSharing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
        
        .font-comic {
          font-family: 'Comic Neue', cursive;
        }
        
        .highlighted-text .highlight {
          background-color: var(--highlight-color, #FFEB3B);
          padding: 0 2px;
          border-radius: 3px;
        }
        
        .story-page p {
          font-size: var(--font-size-base, 1rem);
          line-height: var(--line-spacing, 1.5);
          word-spacing: var(--word-spacing, normal);
        }
        
        @media print {
          header, footer, button {
            display: none !important;
          }
          
          .story-book {
            background: white !important;
            padding: 0 !important;
          }
          
          .story-page {
            break-inside: avoid;
            margin-bottom: 20px;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SightWordStoryGenerator;