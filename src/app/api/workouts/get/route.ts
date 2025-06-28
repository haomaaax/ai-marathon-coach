import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getToken } from 'next-auth/jwt';

const workoutsFilePath = path.resolve(process.cwd(), 'data', 'workouts.json');
const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request: Request) {
  try {
    const token = await getToken({ req: request, secret });

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const workouts: { userId: string }[] = JSON.parse(fs.readFileSync(workoutsFilePath, 'utf-8'));
    const userWorkouts = workouts.filter((workout) => workout.userId === token.sub);

    return NextResponse.json({ workouts: userWorkouts }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving workouts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
