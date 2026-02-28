
import { UserStats, Badge, BadgeTier, Challenge, ChallengeStatus, WorkoutHistoryEntry } from '../types';

// --- CONSTANTS ---
const CHALLENGE_DURATION_MS = 48 * 60 * 60 * 1000; // 48 Hours

// --- STREAK CALCULATION ---
export const recalculateStreak = (history: WorkoutHistoryEntry[]): number => {
    if (!history || history.length === 0) return 0;

    const uniqueDates = Array.from(new Set(history.map(h => h.date))).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWorkoutDate = new Date(uniqueDates[0]);
    lastWorkoutDate.setHours(0, 0, 0, 0);

    if (lastWorkoutDate.getTime() < yesterday.getTime()) {
        return 0;
    }

    let streak = 1;
    let currentDate = lastWorkoutDate;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i]);
        prevDate.setHours(0, 0, 0, 0);

        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
};

// --- MATCHMAKING ENGINE ---
export const generateSmartChallenge = (
    challengerStats: UserStats,
    opponentName: string, 
    opponentId: string,
    postContext?: string
): Challenge => {
    
    let selectedExercise = 'Military Press'; 
    let target = "";
    let metric: 'reps' | 'weight' | 'time' = 'reps';

    const benchMax = challengerStats.maxes?.bench || 50; 
    const squatMax = challengerStats.maxes?.squat || 70;
    const deadliftMax = challengerStats.maxes?.deadlift || 80;

    const contextLower = postContext ? postContext.toLowerCase() : '';
    
    if (contextLower.includes('panca') || contextLower.includes('bench') || contextLower.includes('petto')) {
        selectedExercise = 'Panca Piana';
        const targetWeight = Math.round(benchMax * 0.7); 
        target = `Max Reps con ${targetWeight}kg`;
        metric = 'reps';
    } else if (contextLower.includes('squat') || contextLower.includes('gambe') || contextLower.includes('leg')) {
        selectedExercise = 'Squat';
        const targetWeight = Math.round(squatMax * 0.65); 
        target = `Max Reps con ${targetWeight}kg`;
        metric = 'reps';
    } else if (contextLower.includes('stacco') || contextLower.includes('deadlift') || contextLower.includes('schiena')) {
        selectedExercise = 'Stacco da Terra';
        const targetWeight = Math.round(deadliftMax * 0.8);
        target = `5 Reps pesanti con ${targetWeight}kg`;
        metric = 'weight';
    } else {
        selectedExercise = 'Military Press';
        const targetWeight = Math.max(20, Math.round((benchMax * 0.55) / 2.5) * 2.5);
        target = `Max Reps con ${targetWeight}kg`;
        metric = 'reps';
    }

    const now = Date.now();

    return {
        id: `ch_${now}_${Math.random().toString(36).substr(2, 9)}`,
        challengerId: 'me', 
        opponentId: opponentId,
        opponentName: opponentName,
        title: `Sfida: ${selectedExercise}`,
        exercise: selectedExercise,
        targetMetric: metric,
        targetValue: target,
        status: 'pending', 
        date: 'Adesso',
        createdAt: now,
        expiresAt: now + CHALLENGE_DURATION_MS,
        isIncoming: false
    };
};

// --- EXPIRATION CHECK ---
export const checkChallengeExpiration = (challenge: Challenge, currentUserId?: string): { status: ChallengeStatus } => {
    const now = Date.now();
    if (challenge.status !== 'active') return { status: challenge.status }; 

    if (now > challenge.expiresAt) {
        if (challenge.isIncoming) {
            return { status: 'expired_loss' };
        } else {
             return { status: 'expired_win' };
        }
    }
    return { status: 'active' };
};

// --- BADGE EVALUATOR ---
export const evaluateBadges = (currentBadges: Badge[], stats: UserStats): { updatedBadges: Badge[], newUnlocks: Badge[] } => {
    const newUnlocks: Badge[] = [];
    
    const updatedBadges = currentBadges.map(badge => {
        let metricValue = 0;
        
        switch(badge.id) {
            case 'b1': 
            case 'b5': 
                metricValue = stats.workoutsCompleted || 0;
                break;
            case 'b2': 
                metricValue = stats.streak || 0;
                break;
            case 'b3': 
            case 'b4': 
                metricValue = stats.challengesWon || 0;
                break;
            default:
                metricValue = 0;
        }

        let newTier: BadgeTier = badge.tier;
        let nextThreshold = badge.nextThreshold;
        const t = badge.thresholds;
        
        if (metricValue >= t.legendary) { newTier = 'legendary'; nextThreshold = t.legendary; }
        else if (metricValue >= t.diamond) { newTier = 'diamond'; nextThreshold = t.legendary; }
        else if (metricValue >= t.gold) { newTier = 'gold'; nextThreshold = t.diamond; }
        else if (metricValue >= t.silver) { newTier = 'silver'; nextThreshold = t.gold; }
        else if (metricValue >= t.bronze) { newTier = 'bronze'; nextThreshold = t.silver; }
        else { newTier = 'locked'; nextThreshold = t.bronze; }

        const tiersOrder = ['locked', 'bronze', 'silver', 'gold', 'diamond', 'legendary'];
        if (tiersOrder.indexOf(newTier) > tiersOrder.indexOf(badge.tier)) {
            const unlockedBadge = { ...badge, tier: newTier, currentValue: metricValue, nextThreshold };
            newUnlocks.push(unlockedBadge);
            return unlockedBadge;
        }

        return { ...badge, tier: newTier, currentValue: metricValue, nextThreshold };
    });

    return { updatedBadges, newUnlocks };
};
