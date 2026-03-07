
import { WorkoutCard } from '../types';

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  'Massa': [
    'https://images.unsplash.com/photo-1534368786749-b63e05c90863?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'
  ],
  'Definizione': [
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop'
  ],
  'Perdita Peso': [
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'
  ],
  'Resistenza': [
    'https://images.unsplash.com/photo-1530822847156-5df684ec5933?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517963879466-e825c6329090?q=80&w=800&auto=format&fit=crop'
  ],
  'Custom': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=800&auto=format&fit=crop'
  ]
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop';

/**
 * Returns a suitable image for a workout.
 * Priority:
 * 1. Workout's own image property
 * 2. Category-based fallback
 * 3. Global default fallback
 */
export const getWorkoutImage = (workout: WorkoutCard): string => {
  if (workout.image) return workout.image;

  const fallbacks = CATEGORY_FALLBACKS[workout.category] || [];
  if (fallbacks.length > 0) {
    // Use the workout ID to pick a consistent fallback from the list
    const idNum = workout.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbacks[idNum % fallbacks.length];
  }

  return DEFAULT_FALLBACK;
};
