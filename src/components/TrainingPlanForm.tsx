'use client';

import React, { useState } from 'react';

interface TrainingPlanFormProps {
  onPlanGenerated: (plan: { week: number; phase: string; workouts: string[] }[]) => void;
  planType: 'marathon' | 'half-marathon';
}

// Helper to generate time options in HH:MM:SS format with 5-minute intervals
const generateTimeOptions = (startHours: number, startMinutes: number, endHours: number, intervalMinutes: number): string[] => {
  const times: string[] = ['']; // Empty option for no selection
  for (let h = startHours; h <= endHours; h++) {
    const mStart = (h === startHours) ? startMinutes : 0; // Start minutes from specified for the first hour, else from 0
    for (let m = mStart; m < 60; m += intervalMinutes) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
      // Stop generating if we exceed the end hour or if it's the end hour and we've passed 00 minutes
      if (h === endHours && m > 0 && m >= startMinutes && h * 60 + m > endHours * 60) {
        break;
      }
      times.push(time);
    }
  }
  return times;
};

const marathonTimes = generateTimeOptions(2, 30, 6, 5); // From 02:30:00 to 06:00:00
const halfMarathonTimes = generateTimeOptions(1, 0, 2, 5); // From 01:00:00 to 02:00:00

const focusAreasOptions = ['Speed', 'Endurance', 'Long Runs', 'Hills', 'Recovery', 'Consistency'];

export default function TrainingPlanForm({ onPlanGenerated, planType }: TrainingPlanFormProps) {
  const [planDuration, setPlanDuration] = useState('16'); // Default to 16 weeks
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [marathonTime, setMarathonTime] = useState('');
  const [halfMarathonTime, setHalfMarathonTime] = useState('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const handleFocusAreaChange = (area: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/training-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          planDuration: parseInt(planDuration),
          experienceLevel,
          marathonTime,
          halfMarathonTime,
          selectedFocusAreas,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        onPlanGenerated(data.plan);
      } else {
        setMessage(data.message || 'Failed to generate plan.');
      }
    } catch (error) {
      console.error('Plan generation failed:', error);
      setMessage('Plan generation failed. Please try again.');
    }
  };

  const durationOptions = [];
  for (let i = 8; i <= 20; i++) {
    durationOptions.push(<option key={i} value={i}>{i} Weeks</option>);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Generate Training Plan</h2>
      {message && <p className="text-center text-sm text-red-500">{message}</p>}
      <div>
        <label htmlFor="planDuration" className="block text-sm font-medium text-gray-700 mb-1">Plan Duration</label>
        <select
          id="planDuration"
          value={planDuration}
          onChange={(e) => setPlanDuration(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-gray-900"
          required
        >
          {durationOptions}
        </select>
      </div>
      <div>
        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
        <select
          id="experienceLevel"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-gray-900"
          required
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      {planType === 'marathon' && (
        <div>
          <label htmlFor="marathonTime" className="block text-sm font-medium text-gray-700 mb-1">Past Marathon Time (Optional)</label>
          <select
            id="marathonTime"
            value={marathonTime}
            onChange={(e) => setMarathonTime(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-gray-900"
          >
            <option value="">Select a time</option>
            {marathonTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}
      {planType === 'half-marathon' && (
        <div>
          <label htmlFor="halfMarathonTime" className="block text-sm font-medium text-gray-700 mb-1">Past Half Marathon Time (Optional)</label>
          <select
            id="halfMarathonTime"
            value={halfMarathonTime}
            onChange={(e) => setHalfMarathonTime(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-gray-900"
          >
            <option value="">Select a time</option>
            {halfMarathonTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}

      {/* Focus Areas Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas (Select areas you want to improve)</label>
        <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {focusAreasOptions.map(area => (
            <div key={area} className="flex items-center">
              <input
                type="checkbox"
                id={`focus-area-${area}`}
                checked={selectedFocusAreas.includes(area)}
                onChange={() => handleFocusAreaChange(area)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`focus-area-${area}`} className="ml-2 text-sm text-gray-700">{area}</label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Generate Plan
      </button>
    </form>
  );
}