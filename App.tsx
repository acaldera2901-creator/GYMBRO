
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
import NutrizioneScreen from './screens/NutrizioneScreen';
import BottomNav from './components/BottomNav';
import CoachMarks from './components/CoachMarks';
import { ScreenName, UserProfile, WorkoutCard, UserStats, Post, Badge, Challenge, AppNotification, Story, LeaderboardEntry, Comment, ChallengeStatus } from './types';
import { supabase, fetchUserData, completeWorkoutTransaction, revertWorkoutTransaction, updateGuestProfile, saveFullProfile, fetchCommunityPosts, createPost, toggleLikePost, saveCurrentPlan, saveCustomWorkout, deleteCustomWorkout, fetchCustomWorkouts } from './lib/supabase';
import { Loader2, Medal } from 'lucide-react';
import { generateSmartChallenge, evaluateBadges, recalculateStreak } from './lib/gamification';
import { SecureStorageManager } from './lib/secureStorage';
import { DEFAULT_WORKOUTS, DEFAULT_POSTS, DEFAULT_LEADERBOARD } from './lib/mockData';

// --- PERFORMANCE OPTIMIZATION ---
const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedCalendarScreen = React.memo(CalendarScreen);
const MemoizedCommunityScreen = React.memo(CommunityScreen);

// --- INITIAL STATE ---
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
    workoutHistory: [],
    maxes: { bench: 50, squat: 70, deadlift: 90 } 
};


const App: React.FC = () => {
  // --- STATE ---
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('login');
  
  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<WorkoutCard[]>([]);
  const [workoutSchedule, setWorkoutSchedule] = useState<Record<string, WorkoutCard[]>>({});
  
  // UI State
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tempChallengeData, setTempChallengeData] = useState<Challenge | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('home');
  const [showCoachMarks, setShowCoachMarks] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gymbro_dark_mode');
    return saved !== null ? saved === 'true' : true; // default dark
  });
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('gymbro_dark_mode', String(next));
      return next;
    });
  };

  const themeColor = userProfile.gender === 'Donna' ? 'rose' : 'emerald';
  const isFetchingRef = useRef(false);
  // Accumula dati profilo durante il setup (passati a PreferencesScreen per il salvataggio finale)
  const setupProfileRef = useRef<Partial<any>>({});

  // --- 1. INITIALIZATION ---
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

    // Listener per cambio sessione (token refresh, logout remoto)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
          handleLogoutState();
      } else if (event === 'TOKEN_REFRESHED' && session) {
          SecureStorageManager.saveCredentials('access_token', session.access_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- 2. DATA LOADING (SSOT) ---
  const loadUserData = async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
        setSessionUserId(userId);

        // AUTHENTICATED FLOW
        const dbData = await fetchUserData(userId);
        
        // Se dbData è null o non ha profilo, è un nuovo utente Auth
        if (!dbData || !dbData.profile) {
             // Nuovo utente Supabase -> Setup
             setCurrentScreen('profile-config');
             setIsLoading(false);
             isFetchingRef.current = false;
             return;
        }

        const p = dbData.profile;
        const isSetupComplete = p.setup_completed || (p.name && p.training_days && p.training_days.length > 0);

        if (!isSetupComplete) {
            console.warn("Profilo incompleto, redirect a setup.");
            setUserProfile(prev => ({...prev, id: userId, ...p}));
            setCurrentScreen('profile-config');
            setIsLoading(false);
            isFetchingRef.current = false;
            return;
        }

        hydrateFromData(userId, dbData);
        // Carica le schede custom separatamente (tabella dedicata)
        fetchCustomWorkouts(userId).then(customs => {
            if (customs.length > 0) {
                setGeneratedWorkouts(prev => {
                    const existingIds = new Set(prev.map(w => w.id));
                    const newCustoms = customs.filter(c => !existingIds.has(c.id));
                    return newCustoms.length > 0 ? [...prev, ...newCustoms] : prev;
                });
            }
        }).catch(() => {}); // non-blocking
        setCurrentScreen('home');
        if (!localStorage.getItem('hasSeenCoachMarks')) setTimeout(() => setShowCoachMarks(true), 1000);

    } catch (e) {
        console.error("Errore Caricamento Dati:", e);
        // Fallback sicuro
        setCurrentScreen('profile-config');
    } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
    }
  };

  const hydrateFromData = (userId: string, dbData: any) => {
        const p = dbData.profile;
        const history = dbData.history || [];

        // 1. Hydrate Profilo
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
            trainingDays: p.training_days || [1,3,5],
            favoriteExercises: p.favorite_exercises || [],
            currentPlan: p.current_plan || [],
            tutorialSeen: p.tutorial_seen || false,
            communityTutorialSeen: p.community_tutorial_seen || false
        };
        setUserProfile(loadedProfile);
        
        // Safely set generated workouts
        const activePlan = (loadedProfile.currentPlan && loadedProfile.currentPlan.length > 0)
            ? loadedProfile.currentPlan 
            : DEFAULT_WORKOUTS;
        
        setGeneratedWorkouts(activePlan);

        // 2. Hydrate Stats & History
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
            activeMinutes: workoutHistoryMapped.reduce((acc: number, cur: any) => acc + Math.floor(cur.duration/60), 0),
            weight: loadedProfile.weight,
            height: loadedProfile.height,
            challengesWon: Number(p.challenges_won) || 0,
            badges: mergedBadges,
            workoutHistory: workoutHistoryMapped,
            maxes: p.maxes || { bench: 50, squat: 70, deadlift: 90 } 
        };
        setUserStats(loadedStats);

        // 3. ROBUST SCHEDULE GENERATION & MERGE
        // A. Generate theoretical schedule based on plan + days
        const theoreticalSchedule: Record<string, WorkoutCard[]> = {};
        if (activePlan.length > 0 && loadedProfile.trainingDays.length > 0) {
            generateTheoreticalSchedule(activePlan, loadedProfile.trainingDays, theoreticalSchedule);
        }

        // B. Overlay History (Completed Workouts) onto the schedule
        // This ensures that past days show "Completed" ticks instead of "To Do"
        history.forEach((h: any) => {
            const dateKey = h.date;
            const wData = h.workout_data;
            if (!wData) return;

            const completedWorkout = {
                ...wData,
                id: `db_${h.id}`,
                isCompleted: true,
                completedDuration: h.duration,
                completedAt: h.created_at
            };

            // If there's already a planned workout for this date, replace it or append it
            // Logic: If user did a workout on a planned day, mark that planned workout as done.
            const existingForDate = theoreticalSchedule[dateKey] || [];
            
            // Check if this history item matches a generated plan item (by title or id similarity)
            const matchIndex = existingForDate.findIndex(ew => ew.title === completedWorkout.title || ew.id === completedWorkout.originalId);

            if (matchIndex >= 0) {
                // Replace the theoretical "To Do" with the actual "Done"
                existingForDate[matchIndex] = completedWorkout;
                theoreticalSchedule[dateKey] = existingForDate;
            } else {
                // It was an extra workout, just add it
                theoreticalSchedule[dateKey] = [completedWorkout, ...existingForDate];
            }
        });

        setWorkoutSchedule(theoreticalSchedule);

        // Carica community posts
        initializeMockData(userId);
  };

  // --- 4. HELPERS ---

  // Pure logic function to generate schedule without state side effects
  const generateTheoreticalSchedule = (workouts: WorkoutCard[], trainingDays: number[], outSched: Record<string, WorkoutCard[]>) => {
      const today = new Date();
      // Go back a bit to show recent past in calendar too (e.g. current week)
      const startOffset = -7; 
      
      let workoutIndex = 0;
      const jsDayToAppDay = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1);

      for (let i = startOffset; i < 45; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateKey = date.toISOString().split('T')[0];
          
          // Only generate if empty (don't overwrite existing hydration)
          if (outSched[dateKey] && outSched[dateKey].length > 0) continue;

          if (trainingDays.includes(jsDayToAppDay(date.getDay()))) {
              const baseWorkout = workouts[workoutIndex % workouts.length];
              // Clone to avoid ref issues, add sched_ prefix to ID to distinguish from database IDs
              outSched[dateKey] = [{
                  ...baseWorkout,
                  id: `sched_${dateKey}_${baseWorkout.id}` 
              }];
              workoutIndex++;
          }
      }
  };

  // Legacy state-based generator (kept for compatibility with dynamic updates in Preferences)
  const generateFutureSchedule = useCallback((workouts: WorkoutCard[], trainingDays: number[], existingSched: Record<string, WorkoutCard[]>) => {
      if (!workouts || workouts.length === 0 || !trainingDays || trainingDays.length === 0) return;
      
      const newSched = { ...existingSched };
      generateTheoreticalSchedule(workouts, trainingDays, newSched);
      setWorkoutSchedule(newSched);
  }, []);

  const initializeMockData = (userId: string) => {
      fetchCommunityPosts().then(posts => {
          setCommunityPosts(posts.length > 0 ? posts : DEFAULT_POSTS);
      });
      const userEntry: LeaderboardEntry = { id: userId, name: 'Tu', workouts: 0, badgesCount: 0, rank: 6, isUser: true };
      setLeaderboard([...DEFAULT_LEADERBOARD, userEntry].sort((a,b) => b.workouts - a.workouts).map((x,i)=>({...x, rank: i+1})));
  };

  const handleLogoutState = useCallback(() => {
      SecureStorageManager.clearCredentials('access_token');
      setSessionUserId(null); setUserProfile(DEFAULT_PROFILE); setUserStats(DEFAULT_STATS);
      setGeneratedWorkouts([]); setWorkoutSchedule({}); setCommunityPosts([]);
      setCurrentScreen('login'); setIsLoading(false);
  }, []);

  const handleDeleteWorkout = useCallback(async (workoutId: string) => {
      if (!window.confirm("Sei sicuro di voler eliminare questo allenamento?")) return;
      setIsLoading(true);
      try {
          let realId = workoutId;
          const targetIdClean = String(workoutId).replace(/^(db_|done_|sched_)/, '');
          const historyItem = userStats.workoutHistory.find(h => String(h.id).includes(targetIdClean));
          if (historyItem) realId = historyItem.id;

          if (sessionUserId) await revertWorkoutTransaction(sessionUserId, realId);

          const updatedHistory = userStats.workoutHistory.filter(h => !String(h.id).includes(targetIdClean));
          setUserStats(prev => ({...prev, workoutsCompleted: Math.max(0, prev.workoutsCompleted - 1), streak: recalculateStreak(updatedHistory), workoutHistory: updatedHistory}));

          // Remove from schedule visual state
          setWorkoutSchedule(prev => {
              const nextSched = { ...prev };
              Object.keys(nextSched).forEach(dateKey => {
                  nextSched[dateKey] = nextSched[dateKey].map(w => {
                      if (String(w.id).includes(targetIdClean) || w.id === workoutId) {
                          // Revert to planned state if it was a schedule item, or remove if ad-hoc
                          return { ...w, isCompleted: false, completedImage: undefined, completedDuration: undefined, id: w.id.replace('db_', 'sched_') };
                      }
                      return w;
                  });
              });
              return nextSched;
          });
      } catch (error: any) { console.error("Errore Eliminazione:", error); } finally { setIsLoading(false); }
  }, [userStats, sessionUserId]);

  // BUG FIX #5: handleDeleteCustomWorkout era referenziato ma mai definito → crash
  const handleDeleteCustomWorkout = useCallback(async (workoutId: string) => {
      if (!window.confirm("Eliminare questa scheda personalizzata?")) return;
      try {
          if (sessionUserId) await deleteCustomWorkout(sessionUserId, workoutId);
          setGeneratedWorkouts(prev => prev.filter(w => w.id !== workoutId));
          setUserProfile(p => {
              const updated = (p.currentPlan || []).filter(w => w.id !== workoutId);
              if (sessionUserId) saveCurrentPlan(sessionUserId, updated).catch(console.error);
              return { ...p, currentPlan: updated };
          });
      } catch (error: any) { console.error("Errore eliminazione scheda custom:", error); }
  }, [sessionUserId]);

  // handleSaveCustomWorkout: crea o aggiorna una scheda custom
  const handleSaveCustomWorkout = useCallback(async (workout: WorkoutCard) => {
      try {
          if (sessionUserId) await saveCustomWorkout(sessionUserId, workout);
          setGeneratedWorkouts(prev => {
              const idx = prev.findIndex(w => w.id === workout.id);
              if (idx >= 0) { const u = [...prev]; u[idx] = workout; return u; }
              return [workout, ...prev];
          });
          setUserProfile(p => {
              const plan = p.currentPlan || [];
              const idx = plan.findIndex(w => w.id === workout.id);
              const updated = idx >= 0
                  ? plan.map(w => w.id === workout.id ? workout : w)
                  : [workout, ...plan];
              if (sessionUserId) saveCurrentPlan(sessionUserId, updated).catch(console.error);
              return { ...p, currentPlan: updated };
          });
      } catch (error: any) { alert("Errore salvataggio scheda: " + error.message); }
  }, [sessionUserId]);

  const handleWorkoutComplete = useCallback(async (duration: number, exCount: number, img: string | null, w: WorkoutCard, nextScreen: ScreenName = 'home') => {
      setIsLoading(true);
      try {
          // Stima kg sollevati dal workout
          let estimatedKg = 0;
          w.exercises.forEach(ex => {
              const repsStr = ex.reps ?? '';
              const setsMatch = repsStr.match(/^(\d+)\s*[x\u00d7X]/i);
              const repsMatch = repsStr.match(/[x\u00d7X]\s*(\d+)/i);
              const weightMatch = repsStr.match(/@\s*(\d+)/i) || repsStr.match(/(\d+)\s*kg/i);
              const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
              const reps = repsMatch ? parseInt(repsMatch[1]) : 10;
              const weight = weightMatch ? parseInt(weightMatch[1]) : 0;
              estimatedKg += sets * reps * weight;
          });

          const finalId = `done_${Date.now()}_${w.id}`;
          const newHistoryEntry = { id: finalId, date: new Date().toISOString().split('T')[0], workoutTitle: w.title, duration: duration, category: w.category };
          const updatedHistory = [newHistoryEntry, ...userStats.workoutHistory];

          // Valuta badge con stats aggiornate
          const preEvalStats: UserStats = {
              ...userStats,
              workoutsCompleted: userStats.workoutsCompleted + 1,
              streak: recalculateStreak(updatedHistory),
              workoutHistory: updatedHistory
          };
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

          // Mostra notifica badge sbloccato
          if (newUnlocks.length > 0) {
              setShowBadgeUnlock(newUnlocks[0]);
              setTimeout(() => setShowBadgeUnlock(null), 4000);
          }

          // Update Schedule State
          const dateKey = new Date().toISOString().split('T')[0];
          const completedWorkout = { ...w, id: finalId, isCompleted: true, completedDuration: duration, completedImage: img };
          
          setWorkoutSchedule(p => {
              const dayList = p[dateKey] || [];
              // Replace if exists (planned), append if new
              const idx = dayList.findIndex(item => item.id === w.id);
              if (idx >= 0) {
                  const newList = [...dayList];
                  newList[idx] = completedWorkout;
                  return { ...p, [dateKey]: newList };
              }
              return { ...p, [dateKey]: [completedWorkout, ...dayList] };
          });

          // BUG FIX #1: resetta selectedWorkoutId dopo il completamento.
          // Senza questo, navigando su 'workout' dal BottomNav il workout
          // precedente si riapre (e se era sched_ si auto-avviava).
          setSelectedWorkoutId(null);
          setCurrentScreen(nextScreen);
      } catch (error: any) {
          console.error('Errore Salvataggio:', error);
          const msg = error.message || 'Errore nel salvataggio.';
          if (msg.includes('Sessione scaduta')) {
              if (window.confirm('Sessione scaduta. Vuoi fare il login per salvare i tuoi progressi?')) {
                  handleLogoutState();
              }
          } else {
              alert('Errore nel salvataggio: ' + msg);
          }
      } finally { setIsLoading(false); }
  }, [userStats, sessionUserId]);

  // --- 5. RENDER ---
  const renderScreen = () => {
    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" size={48} /></div>;
    switch (currentScreen) {
      case 'login': return <LoginScreen onLogin={(mode, userId) => { if (userId) { setIsLoading(true); loadUserData(userId); } else { setIsLoading(true); supabase.auth.getSession().then(({data}) => data.session ? loadUserData(data.session.user.id) : setIsLoading(false)); } }} />;
      case 'profile-config': return <ProfileConfigScreen onNext={(d) => {
          setupProfileRef.current = { ...setupProfileRef.current, ...d };
          setUserProfile(p=>({...p, ...d}));
          setCurrentScreen('goal-selection');
        }} onSkip={() => {}} />;
      case 'goal-selection': return <GoalSelectionScreen onFinish={(g, experience, equipment, frequency) => {
          setupProfileRef.current = { ...setupProfileRef.current, goal: g, experience, equipment };
          // BUG FIX #4: salva experience e equipment nel profilo utente in modo che
          // PlanGenerationScreen e il resto dell'app li abbiano disponibili
          setUserProfile(p => ({ ...p, goal: g, experience: experience as any, equipment: equipment as any }));
          if (g === 'custom') {
            setupProfileRef.current = { ...setupProfileRef.current, currentPlan: [] };
          }
          // Pre-imposta i giorni di training in base alla frequenza scelta
          if (frequency) {
            const dayMap: Record<number, number[]> = {
              2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [0,1,2,3,4,5]
            };
            const days = dayMap[frequency] || [1, 3, 5];
            setupProfileRef.current = { ...setupProfileRef.current, trainingDays: days };
            setUserProfile(p => ({ ...p, trainingDays: days }));
          }
          setCurrentScreen('strength-test');
        }} />;
      case 'strength-test': return <StrengthTestScreen onNext={(d) => {
          const safeWeight = parseFloat(d.testWeight.toString());
          const safeReps = parseFloat(d.testReps.toString());
          // Salva anche i massimali diretti noti (knownMaxes) per PlanGenerationScreen
          setupProfileRef.current = {
              ...setupProfileRef.current,
              testExercise: d.testExercise,
              testWeight: safeWeight,
              testReps: safeReps,
              knownMaxes: d.knownMaxes || null
          };
          setUserProfile(p=>({...p, testExercise: d.testExercise, testWeight: safeWeight, testReps: safeReps}));
          // Pre-salva i maxes già noti nello stato stats
          if (d.knownMaxes) {
              setUserStats(p => ({
                  ...p,
                  maxes: {
                      bench:    d.knownMaxes.bench    ?? p.maxes?.bench    ?? 0,
                      squat:    d.knownMaxes.squat    ?? p.maxes?.squat    ?? 0,
                      deadlift: d.knownMaxes.deadlift ?? p.maxes?.deadlift ?? 0,
                  }
              }));
          }
          setCurrentScreen(setupProfileRef.current?.goal === 'custom' ? 'preferences' : 'plan-generation');
      }} />;
      case 'plan-generation': return <PlanGenerationScreen userProfile={{...userProfile, knownMaxes: (setupProfileRef.current as any)?.knownMaxes || null}} onPlanGenerated={(w, calculatedMaxes) => {
          setupProfileRef.current = { ...setupProfileRef.current, currentPlan: w, maxes: calculatedMaxes };
          setGeneratedWorkouts(w);
          setUserProfile(p=>({...p, currentPlan: w}));
          // Salva i massimali calcolati subito nello stato
          if (calculatedMaxes) {
              setUserStats(p => ({ ...p, maxes: calculatedMaxes }));
          }
          setCurrentScreen('preferences');
      }} />;
      case 'preferences': return <PreferencesScreen
          userId={sessionUserId || undefined}
          accumulatedProfile={setupProfileRef.current}
          onNext={(f, days, setupImage) => {
              setUserProfile(p=>({...p, favoriteExercises: f, trainingDays: days, image: setupImage || p.image}));
              generateFutureSchedule(generatedWorkouts, days, {});
              const isCustomGoal = setupProfileRef.current?.goal === 'custom';
              setupProfileRef.current = {};
              setCurrentScreen('home');
              if (isCustomGoal) {
                // Se obiettivo personalizzato, apri subito il builder
                setTimeout(() => setCurrentScreen('custom-workout-builder'), 300);
              } else {
                setTimeout(()=>setShowCoachMarks(true), 1000);
              }
          }} />;
      
      case 'home': return <MemoizedHomeScreen 
        onNavigate={(screen) => {
          // BUG FIX #3b: intercetta la navigazione al builder dalla home (QUICK_ACTIONS "Crea Scheda")
          // per pulire editingWorkout, altrimenti aprirebbe l'ultima scheda in editing
          if (screen === 'custom-workout-builder') setEditingWorkout(null);
          setCurrentScreen(screen);
        }} 
        userProfile={userProfile} 
        userStats={userStats} 
        availableWorkouts={generatedWorkouts} 
        onStartWorkout={(id)=>{ setSelectedWorkoutId(id); setPreviousScreen('home'); setCurrentScreen('workout'); }} 
        isDarkMode={isDarkMode} 
        themeColor={themeColor} 
        notifications={notifications} 
        onMarkNotificationsRead={()=>setNotifications(p=>p.map(n=>({...n, read:true})))} 
      />;
      case 'calendar': return <MemoizedCalendarScreen 
          schedule={workoutSchedule} 
          availableWorkouts={generatedWorkouts} 
          onScheduleWorkout={(d,w)=> { const nw = {...w, id: `sched_${Date.now()}_${w.id}`}; setWorkoutSchedule(p=>({...p, [d]:[...(p[d]||[]), nw]})); }} 
          onRemoveWorkout={(date, id)=>{
             const workout = workoutSchedule[date]?.find(w => w.id === id);
             if (!workout) return;
             if (workout.isCompleted || String(id).startsWith('done_') || String(id).startsWith('db_')) {
               handleDeleteWorkout(id);
             } else {
               setWorkoutSchedule(prev => {
                 const next = { ...prev };
                 if (next[date]) next[date] = next[date].filter(w => w.id !== id);
                 if (next[date]?.length === 0) delete next[date];
                 return next;
               });
             }
          }} 
          onStartWorkout={(id)=>{
            // BUG FIX #9: teniamo traccia che il workout è stato aperto dal calendario,
            // così onBack tornerà al calendario e non alla home
            setSelectedWorkoutId(id);
            setPreviousScreen('calendar');
            setCurrentScreen('workout');
          }} 
          onNavigateHome={()=>setCurrentScreen('home')} 
          isDarkMode={isDarkMode} 
          themeColor={themeColor} 
      />;
      case 'workout': return <WorkoutDetailScreen 
        onBack={() => setCurrentScreen(previousScreen)} 
        initialWorkoutId={selectedWorkoutId} 
        customWorkouts={generatedWorkouts} 
        onWorkoutComplete={(d, e, i, w, n) => { handleWorkoutComplete(d, e, i, w, n); }} 
        onShareToCommunity={(p)=>setCommunityPosts(pr=>[p, ...pr])} 
        isDarkMode={isDarkMode} 
        userProfile={userProfile} 
        onCreateWorkout={() => { 
          setEditingWorkout(null); 
          setCurrentScreen('custom-workout-builder'); 
        }}
        onEditWorkout={(w) => { setEditingWorkout({ workout: w }); setCurrentScreen('custom-workout-builder'); }}
        onDeleteCustomWorkout={handleDeleteCustomWorkout}
      />;
      case 'profile': return <ProfileScreen
          onLogout={handleLogoutState}
          userProfile={userProfile}
          userStats={userStats}
          isDarkMode={isDarkMode}
          toggleTheme={toggleDarkMode}
          onEditProfile={()=>setCurrentScreen('profile-config')}
          onNavigate={(screen) => setCurrentScreen(screen as ScreenName)}
          themeColor={themeColor}
          workoutSchedule={workoutSchedule}
          onDeleteWorkout={(id, date) => { handleDeleteWorkout(id); }}
          onProfileUpdated={(profileUpdates, statsUpdates) => {
              setUserProfile(p => ({ ...p, ...profileUpdates }));
              setUserStats(p => ({
                  ...p,
                  ...statsUpdates,
                  maxes: statsUpdates.maxes ? { ...p.maxes, ...statsUpdates.maxes } : p.maxes
              }));
          }}
      />;
      case 'nutrizione': return <NutrizioneScreen
          userProfile={userProfile}
          userStats={userStats}
          isDarkMode={isDarkMode}
          themeColor={themeColor}
          onBack={() => setCurrentScreen('profile')}
      />;
      case 'community': return <MemoizedCommunityScreen
          onBack={()=>setCurrentScreen('home')}
          isDarkMode={isDarkMode}
          posts={communityPosts}
          stories={stories}
          leaderboard={leaderboard}
          onAddPost={async (p) => {
              if (sessionUserId) {
                  const saved = await createPost(sessionUserId, { user: p.user, userImage: p.userImage, content: p.content, image: p.image, tag: p.tag });
                  setCommunityPosts(pr => [saved || p, ...pr]);
              } else {
                  setCommunityPosts(pr => [p, ...pr]);
              }
          }}
          onLikePost={async (id) => {
              const post = communityPosts.find(p => p.id === id);
              if (!post) return;
              const newLikes = await toggleLikePost(id, post.likes, post.liked || false);
              setCommunityPosts(p => p.map(x => x.id===id ? {...x, likes: newLikes, liked: !x.liked} : x));
          }}
          onPostComment={()=>{}}
          userProfile={userProfile}
          onStartChallenge={(id, name, img, pid, txt)=>{setTempChallengeData(generateSmartChallenge(userStats, name, id, txt)); setSelectedWorkoutId(null); setCurrentScreen('workout');}}
          onUpdateChallenge={()=>{}}
          userStats={userStats}
          challenges={challenges}
          themeColor={themeColor}
      />;
      case 'custom-workout-builder': return <CustomWorkoutBuilder
          onBack={() => { setEditingWorkout(null); setCurrentScreen('workout'); }}
          onSave={(workout) => {
            // Aggiorna lo stato locale SUBITO (navigazione reattiva)
            setGeneratedWorkouts(prev => {
              const idx = prev.findIndex(w => w.id === workout.id);
              if (idx >= 0) { const u = [...prev]; u[idx] = workout; return u; }
              return [workout, ...prev];
            });
            setUserProfile(p => {
              const plan = p.currentPlan || [];
              const idx = plan.findIndex(w => w.id === workout.id);
              const updated = idx >= 0
                ? plan.map(w => w.id === workout.id ? workout : w)
                : [workout, ...plan];
              return { ...p, currentPlan: updated };
            });
            // Naviga subito — lo smontaggio avviene qui
            setEditingWorkout(null);
            setSelectedWorkoutId(workout.id);
            setCurrentScreen('workout');
            // Persisti sul DB in background (fire-and-forget, non bloccante)
            if (sessionUserId) {
              saveCustomWorkout(sessionUserId, workout).catch(console.error);
              // Leggi il piano aggiornato dallo stato per salvarlo
              setUserProfile(p => {
                const updated = p.currentPlan || [];
                saveCurrentPlan(sessionUserId, updated).catch(console.error);
                return p; // non modificare lo stato, solo leggere
              });
            }
          }}
          initialWorkout={editingWorkout?.workout || null}
          isDarkMode={isDarkMode}
          themeColor={themeColor}
        />;
      default: return <LoginScreen onLogin={()=>{}} />;
    }
  };

  const showBottomNav = ['home', 'calendar', 'community', 'profile', 'workout'].includes(currentScreen);

  return (
    <>
      {renderScreen()}
      {showCoachMarks && (
        <CoachMarks
          steps={[]}
          onComplete={() => { setShowCoachMarks(false); localStorage.setItem('hasSeenCoachMarks', 'true'); }}
          themeColor={themeColor}
          userProfile={userProfile}
          userStats={userStats}
          generatedWorkouts={generatedWorkouts}
          workoutSchedule={workoutSchedule}
        />
      )}
      {currentScreen!=='login' && showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={(screen) => {
          // BUG FIX #1b: quando si naviga su 'workout' dal BottomNav (non tramite onStartWorkout),
          // resettiamo selectedWorkoutId così la libreria si apre pulita invece di
          // riaprire/riavviare l'ultimo workout completato.
          if (screen === 'workout') setSelectedWorkoutId(null);
          setCurrentScreen(screen);
        }} isDarkMode={isDarkMode} themeColor={themeColor} />}
      {showBadgeUnlock && (
        <div className="fixed top-16 left-4 right-4 z-[200] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Medal size={24} className="text-yellow-400" />
            </div>
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
