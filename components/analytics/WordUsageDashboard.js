import React, { useEffect, useState } from 'react';
import { BarChart, TrendingUp, BookOpen, Target } from 'lucide-react';

/** Word usage counts across everyone who uses the app, and the signed-in user's story total. */
const WordUsageDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reload, setReload] = useState(0);

  // Load on open and on "Try Again". State is set only when the request returns.
  useEffect(() => {
    let current = true;
    fetch('/api/analytics/wordUsage')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
      })
      .then((data) => {
        if (!current) return;
        setAnalytics(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        if (current) setError(err.message);
      })
      .finally(() => {
        if (current) setIsLoading(false);
      });
    return () => {
      current = false;
    };
  }, [reload]);

  const fetchAnalytics = () => {
    setIsLoading(true);
    setError(null);
    setReload((n) => n + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-ink border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-ink/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-berry/10 border border-berry/30 rounded-lg p-6 text-center">
        <p className="text-ink">The word usage figures couldn&apos;t be loaded.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-berry text-white rounded-xl hover:bg-berry/90"
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
    '3': 'Grade 3'
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
              <p className="text-sm font-medium text-ink/70">Total Stories</p>
              <p className="text-3xl font-bold text-ink mt-2">
                {analytics.totalStories}
              </p>
            </div>
            <div className="bg-mist p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-ink" />
            </div>
          </div>
          <p className="text-xs text-ink/70 mt-4">
            Stories created with this account
          </p>
        </div>

        {/* Unique Words */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink/70">Unique Words</p>
              <p className="text-3xl font-bold text-ink mt-2">
                {analytics.totalUniqueWords}
              </p>
            </div>
            <div className="bg-card-mint p-3 rounded-full">
              <Target className="w-8 h-8 text-leaf" />
            </div>
          </div>
          <p className="text-xs text-ink/70 mt-4">
            Different Dolch words used
          </p>
        </div>

        {/* Most Used Grade */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink/70">Most used reading level</p>
              <p className="text-3xl font-bold text-ink mt-2">
                {(() => {
                  const maxGrade = Object.entries(analytics.byGrade || {})
                    .reduce((max, [grade, count]) =>
                      count > (analytics.byGrade[max] || 0) ? grade : max, '1');
                  return gradeLabels[maxGrade] || 'Grade 1';
                })()}
              </p>
            </div>
            <div className="bg-card-lilac p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-ink" />
            </div>
          </div>
</div>
      </div>

      {/* Top Words Used */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-ink" />
          <h3 className="text-lg font-semibold text-ink">Most Used Sight Words</h3>
        </div>

        {analytics.topWords && analytics.topWords.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.topWords.map((wordData, index) => (
              <div
                key={wordData._id || index}
                className="bg-linear-to-br from-mist to-sky rounded-lg p-4 border border-ink/20"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-ink">
                    {wordData.word}
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {wordData.count}×
                  </span>
                </div>
                <div className="mt-2 text-xs text-ink">
                  Rank #{index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/70 italic text-center py-8">
            No word usage yet. Dolch words are counted as stories are made.
          </p>
        )}
      </div>

      {/* Words by Grade Level */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">
          Word usage by reading level
        </h3>

        <div className="space-y-4">
          {Object.entries(analytics.byGrade || {}).map(([grade, count]) => {
            const percentage = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;

            return (
              <div key={grade} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-ink">
                    {gradeLabels[grade]}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {count} words
                  </span>
                </div>
                <div className="w-full bg-ink/10 rounded-full h-3">
                  <div
                    className="bg-linear-to-r from-ink to-ink h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(analytics.byGrade || {}).length === 0 && (
          <p className="text-ink/70 italic text-center py-8">
            No reading-level data yet.
          </p>
        )}
      </div>
</div>
  );
};

export default WordUsageDashboard;
