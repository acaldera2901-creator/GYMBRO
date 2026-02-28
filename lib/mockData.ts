
import { WorkoutCard, Post, LeaderboardEntry, Challenge } from '../types';

export const DEFAULT_WORKOUTS: WorkoutCard[] = [];

export const DEFAULT_POSTS: Post[] = [
    {
        id: 'p1',
        userId: 'u1',
        user: 'Marco Rossi',
        userImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
        time: '2 ore fa',
        content: 'Ho appena distrutto il mio PR di squat! 140kg x 3 reps. La costanza paga sempre! 💪🔥',
        likes: 42,
        comments: 5,
        commentsList: [
            { id: 'c1', user: 'Giulia B.', text: 'Grande Marco! 🚀', time: '1 ora fa' }
        ],
        tag: 'Allenamento',
        liked: false
    },
    {
        id: 'p2',
        userId: 'u2',
        user: 'Elena Verdi',
        userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        time: '4 ore fa',
        content: 'Sessione HIIT alle 6 del mattino completata. Non c\'è modo migliore per iniziare la giornata.',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        likes: 89,
        comments: 12,
        tag: 'Motivazione',
        liked: true
    },
    {
        id: 'p3',
        userId: 'u3',
        user: 'GymBro Coach',
        time: 'Ieri',
        content: '💡 Tip del giorno: Non trascurare il recupero. I muscoli crescono quando riposi, non quando ti alleni.',
        likes: 156,
        comments: 8,
        tag: 'Consigli',
        liked: false
    }
];

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
    { id: 'op1', name: 'Marco Rossi', workouts: 125, badgesCount: 12, rank: 1, image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61', hasActiveChallenge: true },
    { id: 'op2', name: 'Elena Verdi', workouts: 98, badgesCount: 9, rank: 2, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
    { id: 'op3', name: 'Luca Bianchi', workouts: 85, badgesCount: 8, rank: 3 },
    { id: 'op4', name: 'Sofia Neri', workouts: 60, badgesCount: 6, rank: 4 },
    { id: 'op5', name: 'Alessandro Esposito', workouts: 45, badgesCount: 5, rank: 5 }
];
