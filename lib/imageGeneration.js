export async function generateImage(prompt) {
  try {
    const response = await fetch('/api/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

// Fallback to placeholders when AI generation fails
export function getPlaceholderImage(sentence) {
  const illustrations = [
    "https://picsum.photos/seed/img1/400/240",
    "https://picsum.photos/seed/img2/400/240",
    "https://picsum.photos/seed/img3/400/240"
  ];
  
  // Use a hash of the sentence to consistently get the same illustration for the same sentence
  const hash = sentence.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return illustrations[hash % illustrations.length];
}