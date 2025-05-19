// components/ImageUpload.js
import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { performEnhancedOCR } from '../lib/ocr';

/**
 * Enhanced Image Upload Component with improved mobile device access
 * 
 * Features:
 * - Image preview and cropping
 * - Access to both camera and photo library on mobile
 * - Clear feedback during processing
 * - Better error handling with user-friendly messages
 */
const ImageUpload = ({ onWordsDetected, grade = 2 }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectedWords, setDetectedWords] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // References to file inputs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  /**
   * Process an image through OCR
   * 
   * @param {File} file - The image file to process
   */
  const processImage = async (file) => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // Process with enhanced OCR
      const result = await performEnhancedOCR(file, grade);

      if (result.success && result.words.length > 0) {
        setDetectedWords(result.words);
        onWordsDetected(result.words);
      } else {
        setErrorMessage(
          result.words.length === 0
            ? "No sight words detected. Try a clearer image, different angle, or better lighting."
            : result.error || "Processing failed. Please try again."
        );
      }
    } catch (error) {
      console.error('Image processing error:', error);
      setErrorMessage("An error occurred while processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle image uploads from any source
   * 
   * @param {Event} e - The change event
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  /**
   * Clear the current image and reset state
   */
  const clearImage = () => {
    setPreviewImage(null);
    setErrorMessage(null);
    setDetectedWords([]);
    
    // Reset file inputs
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  /**
   * Toggle photo options menu
   */
  const togglePhotoOptions = () => {
    setShowPhotoOptions(!showPhotoOptions);
  };

  /**
   * Open the camera input
   */
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
    setShowPhotoOptions(false);
  };

  /**
   * Open the photo gallery input
   */
  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
    setShowPhotoOptions(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-1">
        Take a picture or upload an image of sight words
      </div>

      {/* Image Preview Area */}
      {previewImage ? (
        <div className="relative border-2 border-gray-300 rounded-md overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-gray-600 font-medium">Processing sight words...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 text-sm text-red-600 bg-red-50">
              <p className="font-medium">Error:</p> 
              <p>{errorMessage}</p>
              <button
                onClick={clearImage}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Try a different image
              </button>
            </div>
          )}

          {/* Detected Words */}
          {detectedWords.length > 0 && (
            <div className="p-3 bg-green-50">
              <p className="text-sm font-medium text-green-700">
                Detected {detectedWords.length} sight word{detectedWords.length !== 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {detectedWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Upload Area */
        <div className="relative">
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={togglePhotoOptions}
          >
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-700">
              Tap to take a picture or upload an image
            </span>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Take a photo with camera"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-label="Upload a photo from gallery"
          />

          {/* Image Source Options */}
          {showPhotoOptions && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-md z-10">
              <div className="space-y-4 w-full px-4">
                <button
                  onClick={openCamera}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md"
                >
                  <Camera size={20} />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={openGallery}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-md"
                >
                  <ImageIcon size={20} />
                  <span>Choose from Library</span>
                </button>
                <button
                  onClick={togglePhotoOptions}
                  className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips for better scanning */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="font-medium mb-1">Tips for better word detection:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ensure good lighting and avoid shadows</li>
          <li>Keep the image stable and focused</li>
          <li>Place words against a contrasting background</li>
          <li>Position words horizontally if possible</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;