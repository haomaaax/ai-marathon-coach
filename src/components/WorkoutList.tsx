'use client';

import React, { useEffect, useState } from 'react';

interface Workout {
  id: number;
  date: string;
  distance: number;
  duration: number;
  notes?: string;
}

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState('');

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts/get');
      const data = await response.json();

      if (response.ok) {
        setWorkouts(data.workouts);
      } else {
        setMessage(data.message || 'Failed to fetch workouts.');
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setMessage('Error fetching workouts. Please try again.');
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-md bg-gray-50">
      <h2 className="text-xl font-bold text-center">Your Workouts</h2>
      {message && <p className="text-center text-sm text-red-500">{message}</p>}
      {workouts.length === 0 ? (
        <p className="text-center text-gray-500">No workouts logged yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {workouts.map((workout) => (
            <li key={workout.id} className="py-4">
              <p className="text-lg font-semibold">Date: {workout.date}</p>
              <p>Distance: {workout.distance} km</p>
              <p>Duration: {workout.duration} minutes</p>
              {workout.notes && <p>Notes: {workout.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
