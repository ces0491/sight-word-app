// components/ImageUpload.js
import React, { useEffect, useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { performEnhancedOCR } from '../lib/ocr';

/**
 * Scan a photo for Dolch words. On phones it offers the camera or the photo
 * library; the words found go to `onWordsDetected`.
 */
const ImageUpload = ({ onWordsDetected }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectedWords, setDetectedWords] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // References to file inputs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  // Counts scans, so a result for an image that was cleared or replaced is ignored
  const scanRef = useRef(0);

  // Release the preview's memory when it is replaced or the scanner closes
  useEffect(() => () => previewImage && URL.revokeObjectURL(previewImage), [previewImage]);

  /**
   * Process an image through OCR
   *
   * @param {File} file - The image file to process
   */
  const processImage = async (file) => {
    if (!file) return;
    const scan = ++scanRef.current;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setDetectedWords([]);
      setPreviewImage(URL.createObjectURL(file));

      const result = await performEnhancedOCR(file);
      if (scan !== scanRef.current) return;

      if (result.success) {
        setDetectedWords(result.words);
        onWordsDetected(result.words);
      } else {
        setErrorMessage(
          result.error
            ? "The picture couldn't be read. Please try again."
            : 'No words from the Dolch lists were found. Try a clearer image, a different angle or better lighting, or type the words instead.'
        );
      }
    } catch (error) {
      console.error('Image processing error:', error);
      if (scan === scanRef.current) setErrorMessage("The picture couldn't be read. Please try again.");
    } finally {
      if (scan === scanRef.current) setIsProcessing(false);
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
    scanRef.current += 1;
    setIsProcessing(false);
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
      <div className="text-sm font-medium text-ink mb-1">
        Words from the Dolch lists below are picked out of the picture; type any others.
      </div>

      {/* Image Preview Area */}
      {previewImage ? (
        <div className="relative border-2 border-ink/25 rounded-xl overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={previewImage}
              alt="The picture being scanned"
              fill
              style={{ objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-berry text-white p-1 rounded-full"
              aria-label="Remove image"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75">
              <div className="text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-ink border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-ink/70 font-medium">Reading the picture…</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 text-sm text-ink bg-berry/10" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={clearImage}
                className="mt-2 text-xs text-ink hover:text-ink/70 font-medium"
              >
                Try a different image
              </button>
            </div>
          )}

          {/* Detected Words */}
          {detectedWords.length > 0 && (
            <div className="p-3 bg-card-mint/40" role="status">
              <p className="text-sm font-medium text-ink">
                Detected {detectedWords.length} sight word{detectedWords.length !== 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {detectedWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-card-mint text-ink px-2 py-1 rounded-full text-xs"
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
          <button
            type="button"
            className="w-full border-2 border-dashed border-ink/25 rounded-xl p-6 text-center hover:border-ink/50 transition-colors cursor-pointer"
            onClick={togglePhotoOptions}
            aria-expanded={showPhotoOptions}
          >
            <Camera className="mx-auto h-12 w-12 text-ink/40" aria-hidden="true" />
            <span className="mt-2 block text-sm font-medium text-ink">
              Tap to take a picture or upload an image
            </span>
          </button>

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
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl z-10">
              <div className="space-y-4 w-full px-4">
                <button
                  onClick={openCamera}
                  className="w-full flex items-center justify-center gap-2 bg-ink text-white py-3 px-4 rounded-xl"
                >
                  <Camera size={20} />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={openGallery}
                  className="w-full flex items-center justify-center gap-2 bg-leaf text-white py-3 px-4 rounded-xl"
                >
                  <ImageIcon size={20} />
                  <span>Choose from Library</span>
                </button>
                <button
                  onClick={togglePhotoOptions}
                  className="w-full flex items-center justify-center gap-2 bg-ink/20 text-ink py-2 px-4 rounded-xl"
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
      <div className="text-xs text-ink/70 bg-mist p-3 rounded-xl">
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