'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import TrainingPlanForm from '../components/TrainingPlanForm';
import TrainingPlanDisplay from '../components/TrainingPlanDisplay';
import { useTranslation } from 'react-i18next';

interface WorkoutPlanWeek {
  week: number;
  phase: string;
  workouts: string[];
}

export default function Home() {
  const { data: session } = useSession();
  const [trainingPlan, setTrainingPlan] = useState<WorkoutPlanWeek[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<'marathon' | 'half-marathon'>('marathon');
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <header className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{t('marathon_app_title')}</h1>
        <p className="text-lg text-gray-600">{t('marathon_app_subtitle')}</p>
      </header>

      <div className="w-full max-w-3xl flex justify-end mb-4 space-x-2">
        <button
          onClick={() => changeLanguage('en')}
          className={`py-1 px-3 rounded-md text-sm font-semibold ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          English (US)
        </button>
        <button
          onClick={() => changeLanguage('zh-TW')}
          className={`py-1 px-3 rounded-md text-sm font-semibold ${i18n.language === 'zh-TW' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          繁體中文 (台灣)
        </button>
      </div>

      <main className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 sm:p-8 space-y-8">
        {session ? (
          <div className="text-center space-y-6">
            <p className="text-xl font-semibold text-gray-800">{t('welcome_message', { name: session.user?.name })}</p>
            <button
              onClick={() => signOut()}
              className="py-2 px-6 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
            >
              {t('sign_out')}
            </button>

            <div className="flex justify-center mb-6">
              <button
                className={`py-2 px-4 rounded-l-lg font-semibold ${selectedPlanType === 'marathon' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => {
                  setSelectedPlanType('marathon');
                  setTrainingPlan([]); // Clear plan when switching type
                }}
              >
                {t('full_marathon')}
              </button>
              <button
                className={`py-2 px-4 rounded-r-lg font-semibold ${selectedPlanType === 'half-marathon' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => {
                  setSelectedPlanType('half-marathon');
                  setTrainingPlan([]); // Clear plan when switching type
                }}
              >
                {t('half_marathon')}
              </button>
            </div>

            <TrainingPlanForm onPlanGenerated={setTrainingPlan} planType={selectedPlanType} />
            <TrainingPlanDisplay plan={trainingPlan} />
          </div>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-xl font-semibold text-gray-800">{t('sign_in_get_started')}</p>
            <button
              onClick={() => signIn('google')}
              className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              {t('sign_in_google')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}