'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import TrainingPlanForm from '../components/TrainingPlanForm';
import TrainingPlanDisplay from '../components/TrainingPlanDisplay';

interface WorkoutPlanWeek {
  week: number;
  phase: string;
  workouts: string[];
}

export default function Home() {
  const { data: session } = useSession();
  const [trainingPlan, setTrainingPlan] = useState<WorkoutPlanWeek[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<'marathon' | 'half-marathon'>('marathon');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <header className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Marathon Training App</h1>
        <p className="text-lg text-gray-600">Your personalized journey to marathon success.</p>
      </header>

      <main className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-8">
        {session ? (
          <div className="text-center space-y-6">
            <p className="text-xl font-semibold text-gray-800">Welcome, {session.user?.name}!</p>
            <button
              onClick={() => signOut()}
              className="py-2 px-6 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
            >
              Sign out
            </button>

            <div className="flex justify-center mb-6">
              <button
                className={`py-2 px-4 rounded-l-lg font-semibold ${selectedPlanType === 'marathon' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => {
                  setSelectedPlanType('marathon');
                  setTrainingPlan([]); // Clear plan when switching type
                }}
              >
                Full Marathon
              </button>
              <button
                className={`py-2 px-4 rounded-r-lg font-semibold ${selectedPlanType === 'half-marathon' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => {
                  setSelectedPlanType('half-marathon');
                  setTrainingPlan([]); // Clear plan when switching type
                }}
              >
                Half Marathon
              </button>
            </div>

            <TrainingPlanForm onPlanGenerated={setTrainingPlan} planType={selectedPlanType} />
            <TrainingPlanDisplay plan={trainingPlan} />
          </div>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-xl font-semibold text-gray-800">Sign in to get started</p>
            <button
              onClick={() => signIn('google')}
              className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
