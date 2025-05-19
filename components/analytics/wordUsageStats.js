import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, RefreshCw } from 'lucide-react';

const WordUsageStats = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/wordUsage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'An error occurred while fetching analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
        <p className="font-medium">Error: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md flex items-center mx-auto"
        >
          <RefreshCw size={16} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  if (!analytics || !analytics.topWords || analytics.topWords.length === 0) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center">
        <p className="text-yellow-700">No analytics data available yet. Generate and save some stories to see usage statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <BarChart2 size={24} className="text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-800">Most Used Words</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.topWords.map((word, index) => (
            <div key={index} className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-xl font-bold text-blue-600">{word.word}</div>
              <div className="text-sm text-gray-500">Used {word.count} times</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <PieChart size={24} className="text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-green-800">Words by Grade Level</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analytics.byGrade).map(([grade, count]) => (
            <div key={grade} className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-xl font-bold text-green-600">
                {grade === '0' ? 'Kindergarten' : `Grade ${grade}`}
              </div>
              <div className="text-sm text-gray-500">{count} words used</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (count / Object.values(analytics.byGrade).reduce((a, b) => a + b, 0)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3 text-purple-800">Stories Generated</h3>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {analytics.totalStories}
            </div>
            <div className="text-sm text-gray-500">Total stories created</div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3 text-indigo-800">Vocabulary</h3>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-3xl font-bold text-indigo-600">
              {analytics.totalUniqueWords}
            </div>
            <div className="text-sm text-gray-500">Unique words used</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center"
        >
          <RefreshCw size={16} className="mr-2" /> Refresh Data
        </button>
      </div>
    </div>
  );
};

export default WordUsageStats;