'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface TrainingPlanDisplayProps {
  plan: { week: number; phase: string; workouts: string[] }[];
}

export default function TrainingPlanDisplay({ plan }: TrainingPlanDisplayProps) {
  const { t } = useTranslation();

  if (!plan || plan.length === 0) {
    return <p className="text-center text-gray-600 text-lg mt-8">{t('no_plan_generated')}</p>;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center">{t('your_training_plan')}</h2>
      {plan.map((weekData, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('week')} {weekData.week} ({t(weekData.phase.toLowerCase() + '_phase')})</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {weekData.workouts.map((workout: string, workoutIndex: number) => {
              // Simple parsing to translate workout types
              let translatedWorkout = workout;
              if (workout.includes('Easy Run')) translatedWorkout = translatedWorkout.replace('Easy Run', t('easy_run'));
              if (workout.includes('Tempo Run')) translatedWorkout = translatedWorkout.replace('Tempo Run', t('tempo_run'));
              if (workout.includes('Intervals')) translatedWorkout = translatedWorkout.replace('Intervals', t('intervals'));
              if (workout.includes('Long Run')) translatedWorkout = translatedWorkout.replace('Long Run', t('long_run'));
              if (workout.includes('Marathon Pace Run')) translatedWorkout = translatedWorkout.replace('Marathon Pace Run', t('marathon_pace_run'));
              if (workout.includes('Half Marathon Pace Run')) translatedWorkout = translatedWorkout.replace('Half Marathon Pace Run', t('half_marathon_pace_run'));
              if (workout.includes('Rest')) translatedWorkout = translatedWorkout.replace('Rest', t('rest'));
              if (workout.includes('Cross-Train')) translatedWorkout = translatedWorkout.replace('Cross-Train', t('cross_train'));
              if (workout.includes('Hill Repeats')) translatedWorkout = translatedWorkout.replace('Hill Repeats', t('hill_repeats'));
              if (workout.includes('Extra')) translatedWorkout = translatedWorkout.replace('Extra', t('extra'));

              return <li key={workoutIndex}>{translatedWorkout}</li>;
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
