'use client';

import React from 'react';

interface TrainingPlanDisplayProps {
  plan: { week: number; phase: string; workouts: string[] }[];
}

export default function TrainingPlanDisplay({ plan }: TrainingPlanDisplayProps) {
  if (!plan || plan.length === 0) {
    return <p className="text-center text-gray-600 text-lg mt-8">No plan generated yet. Generate one above!</p>;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Your Training Plan</h2>
      {plan.map((weekData, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Week {weekData.week} ({weekData.phase} Phase)</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {weekData.workouts.map((workout: string, workoutIndex: number) => (
              <li key={workoutIndex}>{workout}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}