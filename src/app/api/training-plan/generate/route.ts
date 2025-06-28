import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const trainingPlansFilePath = path.resolve(process.cwd(), 'data', 'trainingPlans.json');

// Helper to convert HH:MM:SS to total seconds
const parseTimeToSeconds = (timeString: string): number | null => {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
};

// Helper to format seconds per km to MM:SS/km
const formatSecondsToPace = (secondsPerKm: number): string => {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}/km`;
};

interface WorkoutPlanWeek {
  week: number;
  phase: string;
  workouts: string[];
}

function isErrorMessage(plan: WorkoutPlanWeek[] | { message: string }): plan is { message: string } {
  return typeof plan === 'object' && plan !== null && 'message' in plan;
}

interface Paces {
  marathonPace: string;
  easyPace: string;
  tempoPace: string;
  intervalPace: string;
}

// Simplified pace calculation based on race time
const calculatePaces = (raceTimeSeconds: number, raceDistanceKm: number, experienceLevel: string): Paces => {
  const targetRacePaceSecondsPerKm = raceTimeSeconds / raceDistanceKm;

  let easyPaceFactor = 1.30; // 30% slower than target race pace
  let tempoPaceFactor = 1.05; // 5% slower than target race pace
  let intervalPaceFactor = 0.95; // 5% faster than target race pace

  if (experienceLevel === 'Intermediate') {
    easyPaceFactor = 1.25;
    tempoPaceFactor = 1.00;
    intervalPaceFactor = 0.90;
  } else if (experienceLevel === 'Advanced') {
    easyPaceFactor = 1.20;
    tempoPaceFactor = 0.95;
    intervalPaceFactor = 0.85;
  }

  const easyPace = targetRacePaceSecondsPerKm * easyPaceFactor;
  const tempoPace = targetRacePaceSecondsPerKm * tempoPaceFactor;
  const intervalPace = targetRacePaceSecondsPerKm * intervalPaceFactor;

  return {
    marathonPace: formatSecondsToPace(targetRacePaceSecondsPerKm),
    easyPace: formatSecondsToPace(easyPace),
    tempoPace: formatSecondsToPace(tempoPace),
    intervalPace: formatSecondsToPace(intervalPace),
  };
};

export async function POST(request: Request) {
  try {
    const { planType, planDuration, experienceLevel, marathonTime, halfMarathonTime, selectedFocusAreas } = await request.json();

    if (!planType || !planDuration || !experienceLevel) {
      return NextResponse.json({ message: 'Plan type, duration, and experience level are required' }, { status: 400 });
    }

    let paces: Paces | null = null;
    const marathonTimeSeconds = marathonTime ? parseTimeToSeconds(marathonTime) : null;
    const halfMarathonTimeSeconds = halfMarathonTime ? parseTimeToSeconds(halfMarathonTime) : null;

    if (planType === 'marathon' && marathonTimeSeconds) {
      paces = calculatePaces(marathonTimeSeconds, 42.195, experienceLevel);
    } else if (planType === 'half-marathon' && halfMarathonTimeSeconds) {
      paces = calculatePaces(halfMarathonTimeSeconds, 21.0975, experienceLevel);
    }

    interface WorkoutPlanWeek {
  week: number;
  phase: string;
  workouts: string[];
}

const generatePlan = (planType: string, totalTrainingWeeks: number, experienceLevel: string, paces: Paces | null, focusAreas: string[]): WorkoutPlanWeek[] | { message: string } => {
      const plan: any[] = [];

      // Define phase lengths (can be adjusted)
      const taperWeeks = 3;
      const buildWeeks = Math.floor((totalTrainingWeeks - taperWeeks) * 0.7); // 70% of remaining
      const baseWeeks = totalTrainingWeeks - taperWeeks - buildWeeks;

      // Ensure at least one week for each phase if totalTrainingWeeks is small
      if (totalTrainingWeeks < taperWeeks + 2) { // At least 2 weeks for base/build
        return { message: `Plan duration is too short. Minimum ${taperWeeks + 2} weeks required.` };
      }

      // Define workout types based on experience level and plan type
      const workoutTemplates: { [key: string]: { [key: string]: { base: string[], build: string[], taper: string[] } } } = {
        'marathon': {
          'Beginner': {
            base: [`Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Easy Run (${paces?.easyPace || '45min'})`, 'Rest', `Long Run (${paces?.easyPace || '60min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '40min'})`, `Tempo Run (${paces?.tempoPace || '20min'})`, 'Rest', `Easy Run (${paces?.easyPace || '50min'})`, `Long Run (${paces?.easyPace || '75min'})`, 'Rest', 'Cross-Train'],
            taper: [`Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Easy Run (${paces?.easyPace || '20min'})`, 'Rest', `Long Run (${paces?.easyPace || '45min'})`, 'Rest', 'Rest'],
          },
          'Intermediate': {
            base: [`Easy Run (${paces?.easyPace || '45min'})`, 'Rest', `Easy Run (${paces?.easyPace || '60min'})`, 'Rest', `Long Run (${paces?.easyPace || '90min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '50min'})`, `Tempo Run (${paces?.tempoPace || '30min'})`, 'Rest', `Intervals (${paces?.intervalPace || '6x800m'})`, `Long Run (${paces?.easyPace || '120min'})`, 'Rest', 'Cross-Train'],
            taper: [`Easy Run (${paces?.easyPace || '40min'})`, 'Rest', `Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Long Run (${paces?.easyPace || '60min'})`, 'Rest', 'Rest'],
          },
          'Advanced': {
            base: [`Easy Run (${paces?.easyPace || '60min'})`, 'Rest', `Easy Run (${paces?.easyPace || '75min'})`, 'Rest', `Long Run (${paces?.easyPace || '120min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '60min'})`, `Tempo Run (${paces?.tempoPace || '45min'})`, 'Rest', `Intervals (${paces?.intervalPace || '8x1000m'})`, `Long Run (${paces?.easyPace || '150min'})`, 'Rest', `Marathon Pace Run (${paces?.marathonPace || '60min'})`],
            taper: [`Easy Run (${paces?.easyPace || '45min'})`, 'Rest', `Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Long Run (${paces?.easyPace || '75min'})`, 'Rest', 'Rest'],
          },
        },
        'half-marathon': {
          'Beginner': {
            base: [`Easy Run (${paces?.easyPace || '20min'})`, 'Rest', `Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Long Run (${paces?.easyPace || '40min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '30min'})`, `Tempo Run (${paces?.tempoPace || '15min'})`, 'Rest', `Easy Run (${paces?.easyPace || '40min'})`, `Long Run (${paces?.easyPace || '50min'})`, 'Rest', 'Cross-Train'],
            taper: [`Easy Run (${paces?.easyPace || '20min'})`, 'Rest', `Easy Run (${paces?.easyPace || '15min'})`, 'Rest', `Long Run (${paces?.easyPace || '30min'})`, 'Rest', 'Rest'],
          },
          'Intermediate': {
            base: [`Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Easy Run (${paces?.easyPace || '45min'})`, 'Rest', `Long Run (${paces?.easyPace || '60min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '40min'})`, `Tempo Run (${paces?.tempoPace || '20min'})`, 'Rest', `Intervals (${paces?.intervalPace || '4x800m'})`, `Long Run (${paces?.easyPace || '75min'})`, 'Rest', 'Cross-Train'],
            taper: [`Easy Run (${paces?.easyPace || '30min'})`, 'Rest', `Easy Run (${paces?.easyPace || '20min'})`, 'Rest', `Long Run (${paces?.easyPace || '45min'})`, 'Rest', 'Rest'],
          },
          'Advanced': {
            base: [`Easy Run (${paces?.easyPace || '45min'})`, 'Rest', `Easy Run (${paces?.easyPace || '60min'})`, 'Rest', `Long Run (${paces?.easyPace || '90min'})`, 'Rest', 'Cross-Train'],
            build: [`Easy Run (${paces?.easyPace || '50min'})`, `Tempo Run (${paces?.tempoPace || '30min'})`, 'Rest', `Intervals (${paces?.intervalPace || '6x800m'})`, `Long Run (${paces?.easyPace || '105min'})`, 'Rest', `Half Marathon Pace Run (${paces?.marathonPace || '45min'})`],
            taper: [`Easy Run (${paces?.easyPace || '40min'})`, 'Rest', `Easy Run (${paces?.easyPace || '25min'})`, 'Rest', `Long Run (${paces?.easyPace || '60min'})`, 'Rest', 'Rest'],
          },
        },
      };

      const selectedWorkouts = workoutTemplates[planType][experienceLevel];

      // Adjust workout templates based on focus areas (treated as weaknesses)
      const adjustedWorkouts = JSON.parse(JSON.stringify(selectedWorkouts)); // Deep copy

      const focusAreaMapping: { [key: string]: string[] } = {
        'Speed': ['Tempo Run', 'Intervals'],
        'Endurance': ['Long Run', 'Easy Run'],
        'Long Runs': ['Long Run'],
        'Hills': ['Hill Repeats'], // New workout type
        'Recovery': ['Rest', 'Cross-Train'],
        'Consistency': ['Easy Run', 'Cross-Train'],
      };

      focusAreas.forEach(area => {
        const typesToAdjust = focusAreaMapping[area];
        if (typesToAdjust) {
          typesToAdjust.forEach(type => {
            // For simplicity, we'll add an extra session of the relevant workout type in the build phase
            // A more advanced logic would modify existing sessions or add specific drills
            if (type === 'Long Run') {
              // Ensure an extra long run is added if not already present
              if (adjustedWorkouts.build.filter((w: string) => w.includes('Long Run')).length < 2) {
                adjustedWorkouts.build.push(`Long Run (Extra - ${paces?.easyPace || '75min'})`);
              }
            } else if (type === 'Intervals') {
              if (adjustedWorkouts.build.filter((w: string) => w.includes('Intervals')).length < 2) {
                adjustedWorkouts.build.push(`Intervals (Extra - ${paces?.intervalPace || '6x800m'})`);
              }
            } else if (type === 'Tempo Run') {
              if (adjustedWorkouts.build.filter((w: string) => w.includes('Tempo Run')).length < 2) {
                adjustedWorkouts.build.push(`Tempo Run (Extra - ${paces?.tempoPace || '30min'})`);
              }
            } else if (type === 'Easy Run') {
              if (adjustedWorkouts.build.filter((w: string) => w.includes('Easy Run')).length < 4) { // Allow up to 4 easy runs
                adjustedWorkouts.build.push(`Easy Run (Extra - ${paces?.easyPace || '45min'})`);
              }
            } else if (type === 'Hill Repeats') {
              if (!adjustedWorkouts.build.some((w: string) => w.includes('Hill Repeats'))) {
                adjustedWorkouts.build.push(`Hill Repeats (Extra)`);
              }
            }
          });
        }
      });

      const finalWorkoutTemplates = adjustedWorkouts;

      // Generate plan week by week
      for (let i = 1; i <= totalTrainingWeeks; i++) {
        let workoutsForWeek: string[] = [];
        let phase: string = '';

        if (i <= baseWeeks) {
          phase = 'Base';
          workoutsForWeek = [...finalWorkoutTemplates.base];
        } else if (i <= baseWeeks + buildWeeks) {
          phase = 'Build';
          workoutsForWeek = [...finalWorkoutTemplates.build];
        } else {
          phase = 'Taper';
          workoutsForWeek = [...finalWorkoutTemplates.taper];
        }

        // Adjust long run distance progressively (simplified)
        if (phase === 'Base' || phase === 'Build') {
          const longRunIndex = workoutsForWeek.findIndex(w => w.includes('Long Run'));
          if (longRunIndex !== -1) {
            // If paces are available, we'll use distance-based long runs, otherwise time-based
            if (paces) {
              let currentDistanceKm;
              if (planType === 'marathon') {
                currentDistanceKm = 5 + (i * 2); // Example progression in km
                if (experienceLevel === 'Intermediate') currentDistanceKm = 8 + (i * 2.5);
                if (experienceLevel === 'Advanced') currentDistanceKm = 10 + (i * 3);

                // Cap long run distance for build phase
                if (phase === 'Build') {
                  if (experienceLevel === 'Beginner' && currentDistanceKm > 20) currentDistanceKm = 20;
                  if (experienceLevel === 'Intermediate' && currentDistanceKm > 28) currentDistanceKm = 28;
                  if (experienceLevel === 'Advanced' && currentDistanceKm > 32) currentDistanceKm = 32;
                }
              } else { // half-marathon
                currentDistanceKm = 3 + (i * 1); // Example progression in km for half
                if (experienceLevel === 'Intermediate') currentDistanceKm = 5 + (i * 1.5);
                if (experienceLevel === 'Advanced') currentDistanceKm = 7 + (i * 2);

                // Cap long run distance for build phase
                if (phase === 'Build') {
                  if (experienceLevel === 'Beginner' && currentDistanceKm > 10) currentDistanceKm = 10;
                  if (experienceLevel === 'Intermediate' && currentDistanceKm > 15) currentDistanceKm = 15;
                  if (experienceLevel === 'Advanced' && currentDistanceKm > 18) currentDistanceKm = 18;
                }
              }

              workoutsForWeek[longRunIndex] = `Long Run (${currentDistanceKm.toFixed(1)}km at ${paces.easyPace})`;
            } else {
              const currentDurationMatch = workoutsForWeek[longRunIndex].match(/\((\d+)min\)/);
              if (currentDurationMatch) {
                let currentDuration = parseInt(currentDurationMatch[1]);
                if (phase === 'Base') {
                  currentDuration += 10 * (i - 1); // Increase by 10 min each base week
                } else if (phase === 'Build') {
                  currentDuration += 15 * (i - baseWeeks - 1); // Increase by 15 min each build week
                }
                workoutsForWeek[longRunIndex] = `Long Run (${currentDuration}min)`;
              }
            }
          }
        }

        plan.push({
          week: i,
          phase: phase,
          workouts: workoutsForWeek,
        });
      }
      return plan;
    };

    const newPlan = generatePlan(planType, planDuration, experienceLevel, paces, selectedFocusAreas);

    if (isErrorMessage(newPlan)) {
      return NextResponse.json(newPlan, { status: 400 });
    }

    const plans = JSON.parse(fs.readFileSync(trainingPlansFilePath, 'utf-8'));
    plans.push({ id: Date.now(), planType, planDuration, experienceLevel, plan: newPlan });
    fs.writeFileSync(trainingPlansFilePath, JSON.stringify(plans, null, 2));

    return NextResponse.json({ message: 'Training plan generated successfully', plan: newPlan }, { status: 200 });
  } catch (error) {
    console.error('Training plan generation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}