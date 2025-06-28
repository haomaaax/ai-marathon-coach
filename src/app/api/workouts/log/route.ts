import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getToken } from 'next-auth/jwt';

const workoutsFilePath = path.resolve(process.cwd(), 'data', 'workouts.json');
const secret = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { date, distance, duration, notes } = await request.json();

    if (!date || !distance || !duration) {
      return NextResponse.json({ message: 'Date, distance, and duration are required' }, { status: 400 });
    }

    const workouts = JSON.parse(fs.readFileSync(workoutsFilePath, 'utf-8'));

    const newWorkout = {
      id: Date.now(),
      userId: token.sub, // Use sub (subject) from JWT as user ID
      date,
      distance,
      duration,
      notes: notes || '',
    };
    workouts.push(newWorkout);

    fs.writeFileSync(workoutsFilePath, JSON.stringify(workouts, null, 2));

    return NextResponse.json({ message: 'Workout logged successfully', workout: newWorkout }, { status: 201 });
  } catch (error) {
    console.error('Workout logging error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
