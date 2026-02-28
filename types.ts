
export type ScreenName = 'login' | 'profile-config' | 'goal-selection' | 'strength-test' | 'preferences' | 'plan-generation' | 'home' | 'calendar' | 'workout' | 'profile' | 'community';

export type CategoryType = 'Massa' | 'Definizione' | 'Perdita Peso' | 'Resistenza';
export type BadgeTier = 'locked' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'expired_win' | 'expired_loss' | 'rejected';

export interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps: string;
  weight?: string;
  completed?: boolean;
  image?: string;
}

export interface WorkoutCard {
  id: string;
  category: CategoryType;
  title: string;
  focus: string;
  exercises: Exercise[];
  affinityScore?: number; 
  completedImage?: string | null; 
  isCompleted?: boolean; 
  completedDuration?: number; 
  isChallenge?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  iconName: 'medal' | 'flame' | 'dumbbell' | 'trophy' | 'star' | 'target' | 'swords';
  tier: BadgeTier;
  category: 'consistency' | 'strength' | 'social';
  currentValue: number;
  thresholds: {
    bronze: number;
    silver: number;
    gold: number;
    diamond: number;
    legendary: number;
  };
  unlockedDate?: string;
  nextThreshold: number;
}

export interface Challenge {
  id: string;
  challengerId: string;
  opponentId: string;
  opponentName: string;
  opponentImage?: string;
  title: string; 
  exercise: string; 
  targetMetric: 'reps' | 'weight' | 'time';
  targetValue: string; 
  status: ChallengeStatus; 
  challengerScore?: number;
  opponentScore?: number;
  winnerId?: string;
  date: string;
  createdAt: number;
  expiresAt: number;
  isIncoming?: boolean;
  linkedPostId?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  image?: string;
  workouts: number; // Sostituito points con workouts
  badgesCount: number;
  rank: number;
  isUser?: boolean;
  hasActiveChallenge?: boolean;
}

export interface WorkoutHistoryEntry {
    id: string;
    date: string;
    workoutTitle: string;
    duration: number;
    category: CategoryType;
}

// Stats dell'utente (Gamification & Metriche)
export interface UserStats {
  user_id?: string; 
  workoutsCompleted: number;
  kgLifted: number;
  streak: number;
  activeMinutes: number;
  weight?: number; 
  height?: number; 
  challengesWon: number;
  badges: Badge[]; 
  workoutHistory: WorkoutHistoryEntry[]; 
  maxes: { 
      bench: number;
      squat: number;
      deadlift: number;
  }
}

// Profilo Utente (Dati Fisici & Anagrafici)
export interface UserProfile {
  id?: string; 
  name: string;
  gender: 'Uomo' | 'Donna' | 'Altro';
  weight: number; 
  height: number; 
  goal: string;
  testExercise: string;
  testWeight: number; 
  testReps: number; 
  image?: string;
  trainingDays: number[]; 
  favoriteExercises: string[]; 
  currentPlan?: WorkoutCard[]; 
  tutorialSeen?: boolean; 
  communityTutorialSeen?: boolean; 
}

export interface Comment {
  id: string;
  user: string;
  userImage?: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  userId: string; 
  user: string;
  userImage?: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  commentsList?: Comment[]; 
  liked?: boolean; 
  tag?: string; 
  activeChallengeId?: string;
  challengeResult?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  imageUrl: string;
  time: string; 
  viewed: boolean;
}

export interface AppNotification {
  id: string;
  type: 'workout' | 'challenge' | 'info' | 'badge_unlock';
  title: string;
  message: string;
  time: string;
  actionScreen?: ScreenName;
  dataId?: string;
  read?: boolean;
}
