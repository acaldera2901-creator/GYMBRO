
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import WorkoutDetailScreen from './screens/WorkoutDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileConfigScreen from './screens/ProfileConfigScreen';
import GoalSelectionScreen from './screens/GoalSelectionScreen';
import StrengthTestScreen from './screens/StrengthTestScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import PlanGenerationScreen from './screens/PlanGenerationScreen';
import CalendarScreen from './screens/CalendarScreen';
import CommunityScreen from './screens/CommunityScreen';
import CustomWorkoutBuilder from './screens/CustomWorkoutBuilder';
import BottomNav from './components/BottomNav';
import CoachMarks from './components/CoachMarks';
import { ScreenName, UserProfile, WorkoutCard, UserStats, Post, Badge, Challenge, AppNotification, Story, LeaderboardEntry, Comment, ChallengeStatus } from './types';
import {
  supabase, fetchUserData, completeWorkoutTransaction, revertWorkoutTransaction,
  updateGuestProfile, saveFullProfile, fetchCommunityPosts, createPost, toggleLikePost,
  saveCustomWorkout, deleteCustomWorkout, saveCurrentPlan, saveTrainingDays, updateProfileField, updateUserStats
} from './lib/supabase';
import { Loader2, Medal } from 'lucide-react';
import { generateSmartChallenge, evaluateBadges, recalculateStreak } from './lib/gamification';
import { SecureStorageManager } from './lib/secureStorage';
import { DEFAULT_WORKOUTS, DEFAULT_POSTS, DEFAULT_LEADERBOARD } from './lib/mockData';

const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedCalendarScreen = React.memo(CalendarScreen);
const MemoizedCommunityScreen = React.memo(CommunityScreen);

const INITIAL_BADGES: Badge[] = [
    { id: 'b1', title: 'Primo Passo', desc: 'Completa allenamenti.', iconName: 'medal', tier: 'locked', category: 'consistency', currentValue: 0, thresholds: { bronze: 1, silver: 5, gold: 10, diamond: 25, legendary: 50 }, nextThreshold: 1 },
    { id: 'b2', title: 'On Fire', desc: 'Giorni consecutivi (Streak).', iconName: 'flame', tier: 'locked', category: 'consistency', currentValue: 0, thresholds: { bronze: 3, silver: 7, gold: 14, diamond: 30, legendary: 60 }, nextThreshold: 3 },
    { id: 'b3', title: 'Sfidante', desc: 'Sfide lanciate/accettate.', iconName: 'dumbbell', tier: 'locked', category: 'social', currentValue: 0, thresholds: { bronze: 1, silver: 5, gold: 10, diamond: 25, legendary: 50 }, nextThreshold: 1 },
    { id: 'b4', title: 'Campione', desc: 'Sfide vinte.', iconName: 'trophy', tier: 'locked', category: 'social', currentValue: 0, thresholds: { bronze: 1, silver: 5, gold: 10, diamond: 20, legendary: 50 }, nextThreshold: 1 },
    { id: 'b5', title: 'Macchina', desc: 'Allenamenti totali.', iconName: 'star', tier: 'locked', category: 'consistency', currentValue: 0, thresholds: { bronze: 10, silver: 25, gold: 50, diamond: 100, legendary: 200 }, nextThreshold: 10 }
];

const DEFAULT_PROFILE: UserProfile = {
    name: '', gender: 'Uomo', weight: 75, height: 175, goal: 'muscle',
    testExercise: 'Panca Piana', testWeight: 50, testReps: 10, image: undefined,
    trainingDays: [1, 3, 5], favoriteExercises: [], currentPlan: [],
    tutorialSeen: false, communityTutorialSeen: false
};

const DEFAULT_STATS: UserStats = {
    workoutsCompleted: 0, kgLifted: 0, streak: 0, activeMinutes: 0,
    weight: 75, height: 175, challengesWon: 0, badges: INITIAL_BADGES,
    workoutHistory: [], maxes: { bench: 50, squat: 70, deadlift: 90 }
};

// Stato globale per la scheda in editing (condiviso tra App e CustomWorkoutBuilder)
type EditingWorkoutState = { workout: WorkoutCard } | null;

const App: React.FC = () => {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('login');

  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<WorkoutCard[]>([]);
  const [workoutSchedule, setWorkoutSchedule] = useState<Record<string, WorkoutCard[]>>({});

  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tempChallengeData, setTempChallengeData] = useState<Challenge | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<EditingWorkoutState>(null);
  const [showCoachMarks, setShowCoachMarks] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gymbro_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => { const next = !prev; localStorage.setItem('gymbro_dark_mode', String(next)); return next; });
  };

  const themeColor = userProfile.gender === 'Donna' ? 'rose' : 'emerald';
  const isFetchingRef = useRef(false);
  const setupProfileRef = useRef<Partial<any>>({});

  // ── 1. INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        SecureStorageManager.saveCredentials('access_token', session.access_token);
        await loadUserData(session.user.id);
      } else {
        setIsLoading(false);
        setCurrentScreen('login');
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') handleLogoutState();
      else if (event === 'TOKEN_REFRESHED' && session) SecureStorageManager.saveCredentials('access_token', session.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── 2. LOAD DATA ─────────────────────────────────────────────────────────────
  const loadUserData = async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      setSessionUserId(userId);
      const dbData = await fetchUserData(userId);
      if (!dbData || !dbData.profile) { setCurrentScreen('profile-config'); return; }
      const p = dbData.profile;
      const isSetupComplete = p.setup_completed || (p.name && p.training_days && p.training_days.length > 0);
      if (!isSetupComplete) {
        setUserProfile(prev => ({ ...prev, id: userId, ...p }));
        setCurrentScreen('profile-config');
        return;
      }
      hydrateFromData(userId, dbData);
      setCurrentScreen('home');
      if (!localStorage.getItem('hasSeenCoachMarks')) setTimeout(() => setShowCoachMarks(true), 1000);
    } catch (e) {
      console.error('Errore Caricamento Dati:', e);
      setCurrentScreen('profile-config');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // ── 3. HYDRATE ───────────────────────────────────────────────────────────────
  const hydrateFromData = (userId: string, dbData: any) => {
    const p = dbData.profile;
    const history = dbData.history || [];
    const dbCustomWorkouts: WorkoutCard[] = dbData.customWorkouts || [];

    const loadedProfile: UserProfile = {
      id: userId,
      name: p.name || p.full_name || 'Utente',
      gender: p.gender || 'Uomo',
      weight: Number(p.weight) || 75,
      height: Number(p.height) || 175,
      goal: p.goal || 'muscle',
      testExercise: p.test_exercise || 'Panca Piana',
      testWeight: Number(p.test_weight) || 50,
      testReps: Number(p.test_reps) || 10,
      image: p.image,
      trainingDays: p.training_days || [1, 3, 5],
      favoriteExercises: p.favorite_exercises || [],
      currentPlan: p.current_plan || [],
      tutorialSeen: p.tutorial_seen || false,
      communityTutorialSeen: p.community_tutorial_seen || false
    };
    setUserProfile(loadedProfile);

    // Piano base (schede di default) + schede custom dell'utente (da DB separato)
    const basePlan = (loadedProfile.currentPlan && loadedProfile.currentPlan.length > 0)
      ? loadedProfile.currentPlan
      : DEFAULT_WORKOUTS;

    // Merge: piano base + custom (evita duplicati per id)
    const baseIds = new Set(basePlan.map(w => w.id));
    const customOnly = dbCustomWorkouts.filter(w => !baseIds.has(w.id));
    const fullPlan = [...basePlan, ...customOnly];
    setGeneratedWorkouts(fullPlan);

    // Stats
    const workoutHistoryMapped = history.map((h: any) => ({
      id: `db_${h.id}`,
      date: h.date,
      workoutTitle: h.workout_data?.title || 'Allenamento',
      duration: h.duration || h.workout_data?.completedDuration || 0,
      category: h.workout_data?.category || 'Massa'
    }));
    const savedBadges = p.badges || [];
    const mergedBadges = INITIAL_BADGES.map(ib => {
      const found = savedBadges.find((b: any) => b.id === ib.id);
      return found ? { ...ib, ...found } : ib;
    });
    const loadedStats: UserStats = {
      user_id: userId,
      workoutsCompleted: workoutHistoryMapped.length,
      kgLifted: Number(p.kg_lifted) || 0,
      streak: recalculateStreak(workoutHistoryMapped),
      activeMinutes: workoutHistoryMapped.reduce((acc: number, cur: any) => acc + Math.floor(cur.duration / 60), 0),
      weight: loadedProfile.weight,
      height: loadedProfile.height,
      challengesWon: Number(p.challenges_won) || 0,
      badges: mergedBadges,
      workoutHistory: workoutHistoryMapped,
      maxes: p.maxes || { bench: 50, squat: 70, deadlift: 90 }
    };
    setUserStats(loadedStats);

    // Schedule
    const theoreticalSchedule: Record<string, WorkoutCard[]> = {};
    if (fullPlan.length > 0 && loadedProfile.trainingDays.length > 0) {
      generateTheoreticalSchedule(fullPlan, loadedProfile.trainingDays, theoreticalSchedule);
    }
    history.forEach((h: any) => {
      const dateKey = h.date;
      const wData = h.workout_data;
      if (!wData) return;
      const completedWorkout = { ...wData, id: `db_${h.id}`, isCompleted: true, completedDuration: h.duration, completedAt: h.created_at };
      const existingForDate = theoreticalSchedule[dateKey] || [];
      const matchIndex = existingForDate.findIndex(ew => ew.title === completedWorkout.title);
      if (matchIndex >= 0) {
        existingForDate[matchIndex] = completedWorkout;
        theoreticalSchedule[dateKey] = existingForDate;
      } else {
        theoreticalSchedule[dateKey] = [completedWorkout, ...existingForDate];
      }
    });
    setWorkoutSchedule(theoreticalSchedule);
    initializeMockData(userId);
  };

  // ── 4. HELPERS ───────────────────────────────────────────────────────────────
  const generateTheoreticalSchedule = (workouts: WorkoutCard[], trainingDays: number[], outSched: Record<string, WorkoutCard[]>) => {
    const today = new Date();
    const startOffset = -7;
    let workoutIndex = 0;
    const jsDayToAppDay = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1);
    // Solo schede non-custom per il calendario automatico
    const schedulableWorkouts = workouts.filter(w => !w.isCustom);
    if (schedulableWorkouts.length === 0) return;
    for (let i = startOffset; i < 45; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      if (outSched[dateKey] && outSched[dateKey].length > 0) continue;
      if (trainingDays.includes(jsDayToAppDay(date.getDay()))) {
        const baseWorkout = schedulableWorkouts[workoutIndex % schedulableWorkouts.length];
        outSched[dateKey] = [{ ...baseWorkout, id: `sched_${dateKey}_${baseWorkout.id}` }];
        workoutIndex++;
      }
    }
  };

  const generateFutureSchedule = useCallback((workouts: WorkoutCard[], trainingDays: number[], existingSched: Record<string, WorkoutCard[]>) => {
    if (!workouts || workouts.length === 0 || !trainingDays || trainingDays.length === 0) return;
    const newSched = { ...existingSched };
    generateTheoreticalSchedule(workouts, trainingDays, newSched);
    setWorkoutSchedule(newSched);
  }, []);

  const initializeMockData = (userId: string) => {
    fetchCommunityPosts().then(posts => { setCommunityPosts(posts.length > 0 ? posts : DEFAULT_POSTS); });
    const userEntry: LeaderboardEntry = { id: userId, name: 'Tu', workouts: 0, badgesCount: 0, rank: 6, isUser: true };
    setLeaderboard([...DEFAULT_LEADERBOARD, userEntry].sort((a, b) => b.workouts - a.workouts).map((x, i) => ({ ...x, rank: i + 1 })));
  };

  const handleLogoutState = useCallback(() => {
    SecureStorageManager.clearCredentials('access_token');
    setSessionUserId(null); setUserProfile(DEFAULT_PROFILE); setUserStats(DEFAULT_STATS);
    setGeneratedWorkouts([]); setWorkoutSchedule({}); setCommunityPosts([]);
    setCurrentScreen('login'); setIsLoading(false);
  }, []);

  // ── 5. DELETE WORKOUT (sessione completata) ───────────────────────────────────
  const handleDeleteWorkout = useCallback(async (workoutId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo allenamento?')) return;
    setIsLoading(true);
    try {
      const targetIdClean = String(workoutId).replace(/^(db_|done_|sched_)/, '');
      const historyItem = userStats.workoutHistory.find(h => String(h.id).includes(targetIdClean));
      const realId = historyItem ? historyItem.id : workoutId;
      if (sessionUserId) await revertWorkoutTransaction(sessionUserId, realId);
      const updatedHistory = userStats.workoutHistory.filter(h => !String(h.id).includes(targetIdClean));
      setUserStats(prev => ({ ...prev, workoutsCompleted: Math.max(0, prev.workoutsCompleted - 1), streak: recalculateStreak(updatedHistory), workoutHistory: updatedHistory }));
      setWorkoutSchedule(prev => {
        const nextSched = { ...prev };
        Object.keys(nextSched).forEach(dateKey => {
          nextSched[dateKey] = nextSched[dateKey].map(w => {
            if (String(w.id).includes(targetIdClean) || w.id === workoutId) {
              return { ...w, isCompleted: false, completedImage: undefined, completedDuration: undefined, id: w.id.replace('db_', 'sched_') };
            }
            return w;
          });
        });
        return nextSched;
      });
    } catch (error: any) { console.error('Errore Eliminazione:', error); } finally { setIsLoading(false); }
  }, [userStats, sessionUserId]);

  // ── 6. DELETE CUSTOM WORKOUT ──────────────────────────────────────────────────
  const handleDeleteCustomWorkout = useCallback(async (workoutId: string) => {
    if (!window.confirm('Eliminare questa scheda personalizzata?')) return;
    try {
      if (sessionUserId) await deleteCustomWorkout(sessionUserId, workoutId);
      const updated = generatedWorkouts.filter(w => w.id !== workoutId);
      setGeneratedWorkouts(updated);
      setUserProfile(p => ({ ...p, currentPlan: updated }));
    } catch (error: any) { console.error('Errore eliminazione scheda:', error); }
  }, [sessionUserId, generatedWorkouts]);

  // ── 7. COMPLETE WORKOUT ───────────────────────────────────────────────────────
  const handleWorkoutComplete = useCallback(async (duration: number, exCount: number, img: string | null, w: WorkoutCard, nextScreen: ScreenName = 'home') => {
    setIsLoading(true);
    try {
      let estimatedKg = 0;
      w.exercises.forEach(ex => {
        const repsStr = ex.reps ?? '';
        const sets = parseInt(repsStr.match(/^(\d+)/)?.[1] || '3');
        const reps = parseInt(repsStr.match(/[x×X]\s*(\d+)/)?.[1] || '10');
        const weight = parseInt(repsStr.match(/@\s*(\d+)/)?.[1] || repsStr.match(/(\d+)\s*kg/i)?.[1] || '0');
        estimatedKg += sets * reps * weight;
      });

      const finalId = `done_${Date.now()}_${w.id}`;
      const newHistoryEntry = { id: finalId, date: new Date().toISOString().split('T')[0], workoutTitle: w.title, duration, category: w.category };
      const updatedHistory = [newHistoryEntry, ...userStats.workoutHistory];
      const preEvalStats: UserStats = { ...userStats, workoutsCompleted: userStats.workoutsCompleted + 1, streak: recalculateStreak(updatedHistory), workoutHistory: updatedHistory };
      const { updatedBadges, newUnlocks } = evaluateBadges(preEvalStats.badges, preEvalStats);
      if (sessionUserId) await completeWorkoutTransaction(sessionUserId, w, duration, updatedBadges);
      setUserStats(prev => ({
        ...prev,
        workoutsCompleted: prev.workoutsCompleted + 1,
        kgLifted: prev.kgLifted + estimatedKg,
        streak: recalculateStreak(updatedHistory),
        activeMinutes: prev.activeMinutes + Math.floor(duration / 60),
        workoutHistory: updatedHistory,
        badges: updatedBadges
      }));
      if (newUnlocks.length > 0) { setShowBadgeUnlock(newUnlocks[0]); setTimeout(() => setShowBadgeUnlock(null), 4000); }
      const dateKey = new Date().toISOString().split('T')[0];
      const completedWorkout = { ...w, id: finalId, isCompleted: true, completedDuration: duration, completedImage: img };
      setWorkoutSchedule(p => {
        const dayList = p[dateKey] || [];
        const idx = dayList.findIndex(item => item.id === w.id || item.id.includes(w.id));
        if (idx >= 0) { const newList = [...dayList]; newList[idx] = completedWorkout; return { ...p, [dateKey]: newList }; }
        return { ...p, [dateKey]: [completedWorkout, ...dayList] };
      });
      setCurrentScreen(nextScreen);
    } catch (error: any) {
      const msg = error.message || 'Errore nel salvataggio.';
      if (msg.includes('Sessione scaduta')) { if (window.confirm('Sessione scaduta. Vuoi fare il login?')) handleLogoutState(); }
      else alert('Errore nel salvataggio: ' + msg);
    } finally { setIsLoading(false); }
  }, [userStats, sessionUserId]);

  // ── 8. SAVE/EDIT CUSTOM WORKOUT ───────────────────────────────────────────────
  const handleSaveCustomWorkout = useCallback(async (workout: WorkoutCard) => {
    try {
      if (sessionUserId) await saveCustomWorkout(sessionUserId, workout);
      setGeneratedWorkouts(prev => {
        const exists = prev.findIndex(w => w.id === workout.id);
        if (exists >= 0) {
          // Edit: sostituisce in-place
          const updated = [...prev];
          updated[exists] = workout;
          return updated;
        }
        // Nuova: aggiunge in cima
        return [workout, ...prev];
      });
      setUserProfile(p => {
        const currentPlan = p.currentPlan || [];
        const exists = currentPlan.findIndex(w => w.id === workout.id);
        const updatedPlan = exists >= 0
          ? currentPlan.map(w => w.id === workout.id ? workout : w)
          : [workout, ...currentPlan];
        // Salva il piano aggiornato nel DB
        if (sessionUserId) saveCurrentPlan(sessionUserId, updatedPlan).catch(console.error);
        return { ...p, currentPlan: updatedPlan };
      });
      if (userProfile.trainingDays && userProfile.trainingDays.length > 0) {
        setWorkoutSchedule(prev => {
          const newSched = { ...prev };
          generateTheoreticalSchedule(
            [workout, ...generatedWorkouts.filter(w => !w.isCustom)],
            userProfile.trainingDays,
            newSched
          );
          return newSched;
        });
      }
    } catch (error: any) {
      alert('Errore nel salvataggio della scheda: ' + error.message);
    }
  }, [sessionUserId, generatedWorkouts, userProfile.trainingDays]);

  // ── 9. RENDER ─────────────────────────────────────────────────────────────────
  const renderScreen = () => {
    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" size={48} /></div>;
    switch (currentScreen) {
      case 'login': return <LoginScreen onLogin={(mode, userId) => {
        if (userId) { setIsLoading(true); loadUserData(userId); }
        else { setIsLoading(true); supabase.auth.getSession().then(({ data }) => data.session ? loadUserData(data.session.user.id) : setIsLoading(false)); }
      }} />;
      case 'profile-config': return <ProfileConfigScreen onNext={(d) => {
        setupProfileRef.current = { ...setupProfileRef.current, ...d };
        setUserProfile(p => ({ ...p, ...d }));
        setCurrentScreen('goal-selection');
      }} onSkip={() => {}} />;
      case 'goal-selection': return <GoalSelectionScreen onFinish={(g) => {
        setupProfileRef.current = { ...setupProfileRef.current, goal: g };
        setUserProfile(p => ({ ...p, goal: g }));
        if (g === 'custom') setupProfileRef.current = { ...setupProfileRef.current, currentPlan: [] };
        setCurrentScreen('strength-test');
      }} />;
      case 'strength-test': return <StrengthTestScreen onNext={(d) => {
        const safeWeight = parseFloat(d.testWeight.toString());
        const safeReps = parseFloat(d.testReps.toString());
        setupProfileRef.current = { ...setupProfileRef.current, testExercise: d.testExercise, testWeight: safeWeight, testReps: safeReps, knownMaxes: d.knownMaxes || null };
        setUserProfile(p => ({ ...p, testExercise: d.testExercise, testWeight: safeWeight, testReps: safeReps }));
        if (d.knownMaxes) setUserStats(p => ({ ...p, maxes: { bench: d.knownMaxes.bench ?? p.maxes?.bench ?? 0, squat: d.knownMaxes.squat ?? p.maxes?.squat ?? 0, deadlift: d.knownMaxes.deadlift ?? p.maxes?.deadlift ?? 0 } }));
        setCurrentScreen(setupProfileRef.current?.goal === 'custom' ? 'preferences' : 'plan-generation');
      }} />;
      case 'plan-generation': return <PlanGenerationScreen
        userProfile={{ ...userProfile, knownMaxes: (setupProfileRef.current as any)?.knownMaxes || null }}
        onPlanGenerated={(w, calculatedMaxes) => {
          setupProfileRef.current = { ...setupProfileRef.current, currentPlan: w, maxes: calculatedMaxes };
          setGeneratedWorkouts(w);
          setUserProfile(p => ({ ...p, currentPlan: w }));
          if (calculatedMaxes) setUserStats(p => ({ ...p, maxes: calculatedMaxes }));
          setCurrentScreen('preferences');
        }} />;
      case 'preferences': return <PreferencesScreen
        userId={sessionUserId || undefined}
        accumulatedProfile={setupProfileRef.current}
        onNext={(f, days, setupImage) => {
          setUserProfile(p => ({ ...p, favoriteExercises: f, trainingDays: days, image: setupImage || p.image }));
          generateFutureSchedule(generatedWorkouts, days, {});
          const isCustomGoal = setupProfileRef.current?.goal === 'custom';
          setupProfileRef.current = {};
          setCurrentScreen('home');
          if (isCustomGoal) setTimeout(() => setCurrentScreen('custom-workout-builder'), 300);
          else setTimeout(() => setShowCoachMarks(true), 1000);
        }} />;
      case 'home': return <MemoizedHomeScreen
        onNavigate={setCurrentScreen} userProfile={userProfile} userStats={userStats}
        availableWorkouts={generatedWorkouts}
        onStartWorkout={(id) => { setSelectedWorkoutId(id); setCurrentScreen('workout'); }}
        isDarkMode={isDarkMode} themeColor={themeColor}
        notifications={notifications}
        onMarkNotificationsRead={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} />;
      case 'calendar': return <MemoizedCalendarScreen
        schedule={workoutSchedule} availableWorkouts={generatedWorkouts}
        onScheduleWorkout={(d, w) => { const nw = { ...w, id: `sched_${Date.now()}_${w.id}` }; setWorkoutSchedule(p => ({ ...p, [d]: [...(p[d] || []), nw] })); }}
        onRemoveWorkout={(date, id) => {
          const workout = workoutSchedule[date]?.find(w => w.id === id);
          if (!workout) return;
          if (workout.isCompleted || String(id).startsWith('done_') || String(id).startsWith('db_')) {
            handleDeleteWorkout(id);
          } else {
            setWorkoutSchedule(prev => { const next = { ...prev }; if (next[date]) next[date] = next[date].filter(w => w.id !== id); if (next[date]?.length === 0) delete next[date]; return next; });
          }
        }}
        onStartWorkout={(id) => { setSelectedWorkoutId(id); setCurrentScreen('workout'); }}
        onNavigateHome={() => setCurrentScreen('home')}
        isDarkMode={isDarkMode} themeColor={themeColor} />;
      case 'workout': return <WorkoutDetailScreen
        onBack={() => setCurrentScreen('home')}
        initialWorkoutId={selectedWorkoutId}
        customWorkouts={generatedWorkouts}
        onWorkoutComplete={(d, e, i, w, n) => handleWorkoutComplete(d, e, i, w, n)}
        onShareToCommunity={(p) => setCommunityPosts(pr => [p, ...pr])}
        isDarkMode={isDarkMode}
        userProfile={userProfile}
        onCreateWorkout={() => { setEditingWorkout(null); setCurrentScreen('custom-workout-builder'); }}
        onEditWorkout={(w) => { setEditingWorkout({ workout: w }); setCurrentScreen('custom-workout-builder'); }}
        onDeleteCustomWorkout={handleDeleteCustomWorkout} />;
      case 'profile': return <ProfileScreen
        onLogout={handleLogoutState}
        userProfile={userProfile} userStats={userStats}
        isDarkMode={isDarkMode} toggleTheme={toggleDarkMode}
        onEditProfile={() => setCurrentScreen('profile-config')}
        themeColor={themeColor} workoutSchedule={workoutSchedule}
        onDeleteWorkout={(id, date) => handleDeleteWorkout(id)}
        onProfileUpdated={(profileUpdates, statsUpdates) => {
          setUserProfile(p => ({ ...p, ...profileUpdates }));
          setUserStats(p => ({ ...p, ...statsUpdates, maxes: statsUpdates.maxes ? { ...p.maxes, ...statsUpdates.maxes } : p.maxes }));
        }} />;
      case 'community': return <MemoizedCommunityScreen
        onBack={() => setCurrentScreen('home')}
        isDarkMode={isDarkMode} posts={communityPosts} stories={stories} leaderboard={leaderboard}
        onAddPost={async (p) => {
          if (sessionUserId) { const saved = await createPost(sessionUserId, { user: p.user, userImage: p.userImage, content: p.content, image: p.image, tag: p.tag }); setCommunityPosts(pr => [saved || p, ...pr]); }
          else setCommunityPosts(pr => [p, ...pr]);
        }}
        onLikePost={async (id) => {
          const post = communityPosts.find(p => p.id === id);
          if (!post) return;
          const newLikes = await toggleLikePost(id, post.likes, post.liked || false);
          setCommunityPosts(p => p.map(x => x.id === id ? { ...x, likes: newLikes, liked: !x.liked } : x));
        }}
        onPostComment={() => {}} userProfile={userProfile}
        onStartChallenge={(id, name, img, pid, txt) => { setTempChallengeData(generateSmartChallenge(userStats, name, id, txt)); setSelectedWorkoutId(null); setCurrentScreen('workout'); }}
        onUpdateChallenge={() => {}} userStats={userStats} challenges={challenges} themeColor={themeColor} />;
      case 'custom-workout-builder': return <CustomWorkoutBuilder
        onBack={() => { setEditingWorkout(null); setCurrentScreen('workout'); }}
        onSave={async (workout) => {
          await handleSaveCustomWorkout(workout);
          setEditingWorkout(null);
          setSelectedWorkoutId(workout.id);
          setCurrentScreen('workout');
        }}
        initialWorkout={editingWorkout?.workout || null}
        isDarkMode={isDarkMode}
        themeColor={themeColor} />;
      default: return <LoginScreen onLogin={() => {}} />;
    }
  };

  const showBottomNav = ['home', 'calendar', 'community', 'profile', 'workout'].includes(currentScreen);

  return (
    <>
      {renderScreen()}
      {showCoachMarks && (
        <CoachMarks steps={[]} onComplete={() => { setShowCoachMarks(false); localStorage.setItem('hasSeenCoachMarks', 'true'); }}
          themeColor={themeColor} userProfile={userProfile} userStats={userStats}
          generatedWorkouts={generatedWorkouts} workoutSchedule={workoutSchedule} />
      )}
      {currentScreen !== 'login' && showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} isDarkMode={isDarkMode} themeColor={themeColor} />}
      {showBadgeUnlock && (
        <div className="fixed top-16 left-4 right-4 z-[200] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0"><Medal size={24} className="text-yellow-400" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest">Badge Sbloccato!</p>
              <p className="text-white font-bold text-sm truncate">{showBadgeUnlock.title} - {showBadgeUnlock.tier}</p>
            </div>
            <button onClick={() => setShowBadgeUnlock(null)} className="text-zinc-500 hover:text-white p-1"><span className="text-lg">&times;</span></button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
