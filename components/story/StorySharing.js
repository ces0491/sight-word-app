import React, { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';

const StorySharing = ({ storyId, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    setError('');
    setIsSharing(true);
    
    try {
      const response = await fetch(`/api/stories/${storyId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to share story');
      }
      
      setSuccess(true);
      setEmail('');
      setMessage('');
      
      // Close dialog after delay on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sharing story:', error);
      setError(error.message || 'An error occurred while sharing the story');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">Share Story</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X size={20} />
          </button>
        </div>
        
        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            Story shared successfully! An email has been sent to {email}.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="recipient@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]"
                placeholder="Add a personal message..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSharing || !email.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
              >
                {isSharing ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Sharing...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Share Story
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StorySharing;