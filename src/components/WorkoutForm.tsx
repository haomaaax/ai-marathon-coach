'use client';

import React, { useState } from 'react';

interface WorkoutFormProps {
  onWorkoutLogged: () => void;
}

export default function WorkoutForm({ onWorkoutLogged }: WorkoutFormProps) {
  const [date, setDate] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, distance: parseFloat(distance), duration: parseFloat(duration), notes }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setDate('');
        setDistance('');
        setDuration('');
        setNotes('');
        onWorkoutLogged(); // Notify parent to refresh workout list
      } else {
        setMessage(data.message || 'Failed to log workout.');
      }
    } catch (error) {
      console.error('Workout logging failed:', error);
      setMessage('Workout logging failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center">Log New Workout</h2>
      {message && <p className="text-center text-sm text-red-500">{message}</p>}
      <div>
        <label htmlFor="workoutDate" className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="workoutDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distance (km)</label>
        <input
          type="number"
          id="distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          step="0.1"
          required
        />
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          step="1"
          required
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Log Workout
      </button>
    </form>
  );
}
