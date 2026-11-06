/**
 * Record which words a story used, for the shared word usage dashboard.
 * The server counts Dolch words only. Failures are logged and ignored: a
 * story shouldn't fail because analytics did.
 */
export async function trackWordUsage(words, grade) {
  if (!words || !words.length) return null;

  try {
    const response = await fetch('/api/analytics/trackWords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, grade }),
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
