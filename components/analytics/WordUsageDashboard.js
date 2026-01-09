import React, { useEffect, useState } from 'react';
import { BarChart, TrendingUp, BookOpen, Target } from 'lucide-react';

/**
 * Word Usage Analytics Dashboard
 * Displays word usage statistics and trends for teachers
 */
const WordUsageDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/analytics/wordUsage');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Error loading analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const gradeLabels = {
    '0': 'Kindergarten',
    '1': 'Grade 1',
    '2': 'Grade 2',
    '3': 'Grade 3',
    '4': 'Grade 4',
    '5': 'Grade 5'
  };

  // Calculate max count for scaling the bar chart
  const maxGradeCount = Math.max(...Object.values(analytics.byGrade || {}), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Stories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalStories}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Stories created with this account
          </p>
        </div>

        {/* Unique Words */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Words</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalUniqueWords}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Different sight words used
          </p>
        </div>

        {/* Most Used Grade */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Used Grade</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(() => {
                  const maxGrade = Object.entries(analytics.byGrade || {})
                    .reduce((max, [grade, count]) =>
                      count > (analytics.byGrade[max] || 0) ? grade : max, '1');
                  return gradeLabels[maxGrade] || 'Grade 1';
                })()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Your most common grade level
          </p>
        </div>
      </div>

      {/* Top Words Used */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">Most Used Sight Words</h3>
        </div>

        {analytics.topWords && analytics.topWords.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.topWords.map((wordData, index) => (
              <div
                key={wordData._id || index}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-blue-800">
                    {wordData.word}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {wordData.count}×
                  </span>
                </div>
                <div className="mt-2 text-xs text-blue-700">
                  Rank #{index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-8">
            No word usage data yet. Create some stories to see your most used words!
          </p>
        )}
      </div>

      {/* Words by Grade Level */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Word Usage by Grade Level
        </h3>

        <div className="space-y-4">
          {Object.entries(analytics.byGrade || {}).map(([grade, count]) => {
            const percentage = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;

            return (
              <div key={grade} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {gradeLabels[grade]}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {count} words
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(analytics.byGrade || {}).length === 0 && (
          <p className="text-gray-500 italic text-center py-8">
            No grade-level data yet. Start creating stories to see distribution!
          </p>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📊 Understanding Your Analytics
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Top Words:</strong> These are your most frequently used sight words. Consider introducing variety for comprehensive learning.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Grade Distribution:</strong> Shows which grade levels you focus on most. Try to maintain consistency within each student's level.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Unique Words:</strong> Higher numbers indicate more diverse vocabulary practice across your stories.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WordUsageDashboard;
