import React, { useState, useEffect } from 'react';
import { Camera, FileUp, Edit3, Save, Book, Printer, BookOpen, Image, Zap, List, UserCheck, PlayCircle, Download } from 'lucide-react';

const SightWordStoryGenerator = () => {
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
  
  // Handle manual word input
  const handleManualWordAdd = () => {
    if (manualWordInput.trim()) {
      const newWords = manualWordInput.split(/[\s,]+/).filter(word => word.trim().length > 0);
      setWords([...words, ...newWords]);
      setManualWordInput('');
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // This would be replaced with actual file parsing logic in a production app
    // For demo purposes, we'll simulate parsing a text file with comma or space-separated words
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const newWords = fileContent.split(/[\s,]+/).filter(word => word.trim().length > 0);
      setWords([...words, ...newWords]);
    };
    reader.readAsText(file);
  };
  
  // Handle image upload (for OCR)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    
    // In a real app, this would send the image to an OCR service
    // For demo purposes, we'll just simulate getting words back after a delay
    setTimeout(() => {
      // Simulated OCR result based on common sight words
      const sampleWords = ['the', 'and', 'cat', 'dog', 'house', 'my', 'is', 'big', 'little', 'boy', 'girl'];
      // Randomly select 5-10 words
      const numberOfWords = Math.floor(Math.random() * 6) + 5;
      const randomWords = [];
      for (let i = 0; i < numberOfWords; i++) {
        const randomIndex = Math.floor(Math.random() * sampleWords.length);
        randomWords.push(sampleWords[randomIndex]);
      }
      setWords([...words, ...randomWords]);
    }, 1500);
  };
  
  // Generate a story from the words
  const generateStory = () => {
    if (words.length === 0) return;
    
    setIsGeneratingStory(true);
    
    // In a real app, this would call an API to generate the story
    // For demo purposes, we'll create a simple story using the words
    setTimeout(() => {
      // Example story generation logic
      const storyTypes = [
        { title: "A Day at School", template: "SUBJECT went to school. SUBJECT saw PERSON. They read a OBJECT together. PERSON said, \"I like this ADJECTIVE OBJECT!\" After school, they went to the PLACE. It was a ADJECTIVE day!" },
        { title: "The Adventure", template: "One day, SUBJECT went to the PLACE. SUBJECT found a ADJECTIVE OBJECT. \"Look at this!\" SUBJECT said to PERSON. They played with the OBJECT all day. It was ADJECTIVE!" },
        { title: "My Pet", template: "SUBJECT has a ADJECTIVE pet. It is a ANIMAL. The ANIMAL likes to play in the PLACE. \"Come here!\" says SUBJECT. PERSON helps SUBJECT feed the ANIMAL. They are ADJECTIVE." }
      ];
      
      // Categorize words to help with story structure
      const subjects = words.filter(w => ['I', 'we', 'he', 'she', 'they', 'my', 'our'].includes(w.toLowerCase()));
      const objects = words.filter(w => ['book', 'ball', 'toy', 'car', 'dog', 'cat', 'house', 'school', 'party'].includes(w.toLowerCase()));
      const adjectives = words.filter(w => ['big', 'small', 'happy', 'sad', 'good', 'bad', 'new', 'old', 'pretty', 'funny'].includes(w.toLowerCase()));
      const places = words.filter(w => ['house', 'school', 'park', 'home', 'garden', 'shop', 'store'].includes(w.toLowerCase()));
      const persons = words.filter(w => ['friend', 'teacher', 'mom', 'dad', 'brother', 'sister', 'girl', 'boy'].includes(w.toLowerCase()));
      const animals = words.filter(w => ['dog', 'cat', 'bird', 'fish', 'rabbit'].includes(w.toLowerCase()));
      
      // Pick a random story template
      const storyType = storyTypes[Math.floor(Math.random() * storyTypes.length)];
      
      // Fill in the template with words, or use defaults if we don't have matching words
      let storyText = storyType.template;
      storyText = storyText.replace(/SUBJECT/g, subjects.length > 0 ? subjects[Math.floor(Math.random() * subjects.length)] : 'I');
      storyText = storyText.replace(/OBJECT/g, objects.length > 0 ? objects[Math.floor(Math.random() * objects.length)] : 'toy');
      storyText = storyText.replace(/ADJECTIVE/g, adjectives.length > 0 ? adjectives[Math.floor(Math.random() * adjectives.length)] : 'nice');
      storyText = storyText.replace(/PLACE/g, places.length > 0 ? places[Math.floor(Math.random() * places.length)] : 'park');
      storyText = storyText.replace(/PERSON/g, persons.length > 0 ? persons[Math.floor(Math.random() * persons.length)] : 'friend');
      storyText = storyText.replace(/ANIMAL/g, animals.length > 0 ? animals[Math.floor(Math.random() * animals.length)] : 'pet');
      
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
    }, 2000);
  };
  
  // Save the current story
  const saveStory = () => {
    if (!generatedStory) return;
    
    // Add story to saved stories
    setSavedStories([generatedStory, ...savedStories]);
    
    // In a real app, this would also persist the story to a database or local storage
    alert("Story saved successfully!");
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
  };
  
  // Generate an illustration based on a sentence
  const getIllustrationForSentence = (sentence) => {
    // This would be replaced with actual image generation in a production app
    // For demo purposes, we'll return placeholder illustrations
    const illustrations = [
		"https://picsum.photos/seed/img1/400/240",
		"https://picsum.photos/seed/img2/400/240",
		"https://picsum.photos/seed/img3/400/240"
    ];
    
    // Use a hash of the sentence to consistently get the same illustration for the same sentence
    const hash = sentence.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return illustrations[hash % illustrations.length];
  };
  
  // Highlighted text rendering
  const renderHighlightedText = (text) => {
    return words.reduce((acc, word) => {
      // Create a regular expression that matches the whole word (with word boundaries)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return acc.replace(regex, `<span class="highlight">$&</span>`);
    }, text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sight Word Story Generator</h1>
          <nav className="flex space-x-4">
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
              onClick={() => setCurrentTab('saved')}
            >
              Saved Stories
            </button>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {currentTab === 'input' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Panel */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Enter Sight Words</h2>
              
              {/* Input Type Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setInputMethod('manual')}
                >
                  <Edit3 size={18} /> Manual Entry
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                  onClick={() => setInputMethod('file')}
                >
                  <FileUp size={18} /> Upload File
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${inputMethod === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
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
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., cat dog house"
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
                        <img src={previewImage} alt="Preview" className="max-h-40 mx-auto" />
                        <button 
                          onClick={() => setPreviewImage(null)}
                          className="text-red-600 text-sm font-medium"
                        >
                          Remove image
                        </button>
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
                  <h3 className="text-lg font-medium">Current Words ({words.length})</h3>
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
                        <span className="mr-2">{word}</span>
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
              <h2 className="text-xl font-semibold mb-4">Story Settings</h2>
              
              {/* Grade Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Considerations
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adhd"
                      checked={learningNeeds.adhd}
                      onChange={(e) => setLearningNeeds({...learningNeeds, adhd: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="adhd" className="ml-2 text-sm text-gray-700">ADHD</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dyslexia"
                      checked={learningNeeds.dyslexia}
                      onChange={(e) => setLearningNeeds({...learningNeeds, dyslexia: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="dyslexia" className="ml-2 text-sm text-gray-700">Dyslexia</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autism"
                      checked={learningNeeds.autism}
                      onChange={(e) => setLearningNeeds({...learningNeeds, autism: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="autism" className="ml-2 text-sm text-gray-700">Autism Spectrum</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="esl"
                      checked={learningNeeds.esl}
                      onChange={(e) => setLearningNeeds({...learningNeeds, esl: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="esl" className="ml-2 text-sm text-gray-700">English as Second Language</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="visualProcessing"
                      checked={learningNeeds.visualProcessing}
                      onChange={(e) => setLearningNeeds({...learningNeeds, visualProcessing: e.target.checked})}
                      className="h-4 w-4 text-blue-600"
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
                    className="h-4 w-4 text-blue-600"
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{generatedStory.title}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={saveStory}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md"
                >
                  <Save size={16} /> Save Story
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Contains {generatedStory.words.length} sight words • Grade {generatedStory.grade} level
                {Object.entries(generatedStory.learningNeeds)
                  .filter(([_, value]) => value)
                  .map(([key]) => key)
                  .length > 0 && ` • Optimized for ${Object.entries(generatedStory.learningNeeds)
                    .filter(([_, value]) => value)
                    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
                    .join(', ')}`
                }
              </p>
            </div>
            
            <div className="story-book bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto">
              {generatedStory.content.map((sentence, index) => (
                <div key={index} className="mb-8">
                  <div className="story-page p-4 bg-white rounded-lg shadow-md">
                    <p className="text-xl leading-relaxed mb-4 font-comic">
                      {generatedStory.format === 'normal' && sentence}
                      {generatedStory.format === 'highlighted' && (
                        <span dangerouslySetInnerHTML={{ 
                          __html: renderHighlightedText(sentence) 
                        }} className="highlighted-text" />
                      )}
                      {generatedStory.format === 'bold' && (
                        <span dangerouslySetInnerHTML={{ 
                          __html: renderHighlightedText(sentence).replace(
                            /<span class="highlight">(.*?)<\/span>/g, 
                            '<strong>$1</strong>'
                          ) 
                        }} />
                      )}
                      {generatedStory.format === 'underlined' && (
                        <span dangerouslySetInnerHTML={{ 
                          __html: renderHighlightedText(sentence).replace(
                            /<span class="highlight">(.*?)<\/span>/g, 
                            '<u>$1</u>'
                          ) 
                        }} />
                      )}
                    </p>
                    
                    {includeImages && (
                      <img 
                        src={getIllustrationForSentence(sentence)}
                        alt={`Illustration for: ${sentence}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Words List */}
              <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Sight Words Used:</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedStory.words.map((word, index) => (
                    <span key={index} className="bg-blue-100 px-3 py-1 rounded-full">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Saved Stories Panel */}
        {currentTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Stories</h2>
            
            {savedStories.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No saved stories yet.</p>
                <button
                  onClick={() => setCurrentTab('input')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Create Your First Story
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedStories.map((story) => (
                  <div key={story.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{story.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(story.timestamp).toLocaleDateString()} • 
                          {story.words.length} words • Grade {story.grade}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setGeneratedStory(story);
                            setCurrentTab('preview');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="View Story"
                        >
                          <Book size={18} />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Download Story"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700 line-clamp-2">
                        {story.content[0]}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {story.words.slice(0, 5).map((word, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                            {word}
                          </span>
                        ))}
                        {story.words.length > 5 && (
                          <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                            +{story.words.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-100 border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Sight Word Story Generator • An educational tool for teachers and students</p>
        </div>
      </footer>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
        
        .font-comic {
          font-family: 'Comic Neue', cursive;
        }
        
        .highlighted-text .highlight {
          background-color: #FFEB3B;
          padding: 0 2px;
          border-radius: 3px;
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