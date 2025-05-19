import React, { useState } from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';

const StoryEditor = ({ story, onSave, onCancel }) => {
  const [title, setTitle] = useState(story ? story.title : '');
  const [content, setContent] = useState(story ? story.content : []);
  const [words, setWords] = useState(story ? story.words : []);
  const [format, setFormat] = useState(story ? story.format : 'highlighted');
  const [includeImages, setIncludeImages] = useState(story ? story.includeImages : true);
  const [grade, setGrade] = useState(story ? story.grade : 1);
  const [learningNeeds, setLearningNeeds] = useState(
    story 
      ? story.learningNeeds 
      : {
          adhd: false,
          dyslexia: false,
          autism: false,
          esl: false,
          visualProcessing: false,
        }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSentence = () => {
    setContent([...content, '']);
  };

  const handleUpdateSentence = (index, value) => {
    const newContent = [...content];
    newContent[index] = value;
    setContent(newContent);
  };

  const handleRemoveSentence = (index) => {
    const newContent = [...content];
    newContent.splice(index, 1);
    setContent(newContent);
  };

  const handleAddWord = (word) => {
    if (!word.trim()) return;
    setWords([...words, word.trim().toLowerCase()]);
  };

  const handleRemoveWord = (index) => {
    const newWords = [...words];
    newWords.splice(index, 1);
    setWords(newWords);
  };

  const handleWordInputKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      handleAddWord(e.target.value);
      e.target.value = '';
      e.preventDefault();
    }
  };

  const handleSubmit = async () => {
    if (!title || content.length === 0 || words.length === 0) {
      alert('Please fill in all required fields: title, content, and words.');
      return;
    }

    setIsSaving(true);
    
    const updatedStory = {
      ...(story || {}),
      title,
      content,
      words,
      format,
      includeImages,
      grade,
      learningNeeds,
    };

    try {
      await onSave(updatedStory);
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={onCancel}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {story ? 'Edit Story' : 'Create New Story'}
          </h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-green-300"
        >
          {isSaving ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Story
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Story Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter story title"
            required
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Story Content
            </label>
            <button
              type="button"
              onClick={handleAddSentence}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Sentence
            </button>
          </div>
          {content.length === 0 ? (
            <p className="text-gray-500 italic mb-2">No content yet. Add your first sentence.</p>
          ) : (
            <div className="space-y-3">
              {content.map((sentence, index) => (
                <div key={index} className="flex items-start gap-2">
                  <textarea
                    value={sentence}
                    onChange={(e) => handleUpdateSentence(index, e.target.value)}
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 min-h-[80px]"
                    placeholder={`Sentence ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSentence(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                    title="Remove sentence"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Words */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Sight Words
            </label>
            <span className="text-sm text-gray-500">{words.length} words</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {words.map((word, index) => (
              <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                <span className="mr-2 text-blue-800">{word}</span>
                <button 
                  onClick={() => handleRemoveWord(index)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  &times;
                </button>
              </div>
            ))}
            {words.length === 0 && (
              <p className="text-gray-500 italic">No words added yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new word"
              className="flex-grow border border-gray-300 rounded-md px-3 py-2"
              onKeyDown={handleWordInputKeyDown}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.target.previousSibling;
                handleAddWord(input.value);
                input.value = '';
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>

        {/* Settings: Two Columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Format
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="highlighted"
                    checked={format === 'highlighted'}
                    onChange={() => setFormat('highlighted')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Highlighted Words</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="bold"
                    checked={format === 'bold'}
                    onChange={() => setFormat('bold')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bold Words</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="underlined"
                    checked={format === 'underlined'}
                    onChange={() => setFormat('underlined')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Underlined Words</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="normal"
                    checked={format === 'normal'}
                    onChange={() => setFormat('normal')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Normal Text (No Formatting)</span>
                </label>
              </div>
            </div>

            {/* Include Images */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">
                  Include Illustrations
                </label>
              </div>
            </div>
          </div>

          <div>
            {/* Grade Level */}
            <div className="mb-4">
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
            <div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;