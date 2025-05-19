// Track word usage
export async function trackWordUsage(words, grade) {
  if (!words || !words.length) return;
  
  try {
    const response = await fetch('/api/analytics/trackWords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        words,
        grade
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track word usage');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error tracking word usage:', error);
    return null;
  }
}

// Fetch word usage analytics
export async function fetchWordAnalytics() {
  try {
    const response = await fetch('/api/analytics/wordUsage');
    
    if (!response.ok) {
      throw new Error('Failed to fetch word analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching word analytics:', error);
    throw error;
  }
}

// Get most common grade-appropriate words
export async function getSuggestedWords(grade) {
  try {
    const response = await fetch(`/api/analytics/suggestedWords?grade=${grade}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggested words');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggested words:', error);
    return [];
  }
}