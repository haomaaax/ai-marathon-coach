'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Workout {
  id: number;
  date: string;
  distance: number;
  duration: number;
  notes?: string;
}

interface AggregatedData {
  week: string;
  distance: number;
  duration: number;
}

export default function ProgressDashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState('');
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);

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

  useEffect(() => {
    if (workouts.length > 0) {
      const weeklyData: { [key: string]: { distance: number; duration: number } } = {};

      workouts.forEach(workout => {
        const workoutDate = new Date(workout.date);
        const year = workoutDate.getFullYear();
        const month = workoutDate.getMonth() + 1; // Months are 0-indexed
        const day = workoutDate.getDate();

        // Simple weekly aggregation (can be improved for ISO weeks)
        const weekKey = `${year}-${month}-${Math.ceil(day / 7)}`;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { distance: 0, duration: 0 };
        }
        weeklyData[weekKey].distance += workout.distance;
        weeklyData[weekKey].duration += workout.duration;
      });

      const sortedData = Object.keys(weeklyData).sort().map(key => ({
        week: key,
        distance: weeklyData[key].distance,
        duration: weeklyData[key].duration,
      }));
      setAggregatedData(sortedData);
    }
  }, [workouts]);

  const totalDistance = workouts.reduce((sum, workout) => sum + workout.distance, 0);
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold text-center">Your Progress Dashboard</h2>
      {message && <p className="text-center text-sm text-red-500">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold">Total Distance</h3>
          <p className="text-2xl font-bold">{totalDistance.toFixed(2)} km</p>
        </div>
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold">Total Duration</h3>
          <p className="text-2xl font-bold">{totalDuration.toFixed(0)} minutes</p>
        </div>
      </div>

      {aggregatedData.length > 0 && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-center mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="distance" fill="#8884d8" name="Distance (km)" />
              <Bar dataKey="duration" fill="#82ca9d" name="Duration (minutes)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
