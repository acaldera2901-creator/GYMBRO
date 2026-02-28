
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
import BottomNav from './components/BottomNav';
import CoachMarks, { Step } from './components/CoachMarks';
import BiometricGate from './components/BiometricGate';
import { ScreenName, UserProfile, WorkoutCard, UserStats, Post, Badge, Challenge, AppNotification, Story, LeaderboardEntry, Comment, ChallengeStatus } from './types';
import { supabase, fetchUserData, completeWorkoutTransaction, revertWorkoutTransaction, updateGuestProfile } from './lib/supabase';
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

const TUTORIAL_STEPS: Step[] = [
    { targetId: 'orbit-profile', title: 'La tua Dashboard', desc: 'Tocca qui per vedere i tuoi progressi, medaglie e statistiche.', position: 'bottom' },
    { targetId: 'action-workout-main', title: 'Allenati', desc: 'Avvia subito il tuo allenamento programmato per oggi.', position: 'top' },
    { targetId: 'card-next-workout', title: 'Prossimo Workout', desc: 'Qui trovi i dettagli della tua prossima scheda.', position: 'top' },
    { targetId: 'nav-community', title: 'Social & Sfide', desc: 'Entra nell\'arena per sfidare altri atleti e scalare la classifica.', position: 'top' },
];

const App: React.FC = () => {
  // --- STATE ---
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('login');
  const [isAppLocked, setIsAppLocked] = useState(false);
  
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
  const [showCoachMarks, setShowCoachMarks] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const themeColor = userProfile.gender === 'Donna' ? 'rose' : 'emerald';
  const isFetchingRef = useRef(false);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    if (SecureStorageManager.isBiometricsEnabled()) setIsAppLocked(true);

    const init = async () => {
      // Check for saved Guest ID in LocalStorage first
      const savedGuestId = localStorage.getItem('gymbro_guest_id');
      if (savedGuestId) {
          await loadUserData(savedGuestId);
          return;
      }

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
  }, []);

  // --- 2. DATA LOADING (SSOT) ---
  const loadUserData = async (userId: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
        setSessionUserId(userId);

        // A. GUEST FLOW
        if (userId.startsWith('guest_')) {
            const guestData = await fetchUserData(userId); 
            
            // Fix "Chi Sei" Loop: Check setup_completed flag or specific fields
            const p = guestData?.profile || {};
            const isSetupComplete = p.setup_completed || (p.name && p.training_days && p.training_days.length > 0);

            if (!guestData || !isSetupComplete) {
                // User exists but setup is incomplete
                setUserProfile(prev => ({...prev, id: userId, ...p}));
                setCurrentScreen('profile-config');
            } else {
                // User has data, hydrate properly
                hydrateFromData(userId, guestData);
                setCurrentScreen('home');
            }
            setIsLoading(false);
            isFetchingRef.current = false;
            return;
        }

        // B. AUTHENTICATED FLOW
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
            name: p.full_name || p.name || 'Utente',
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
      setCommunityPosts(DEFAULT_POSTS);
      const userEntry: LeaderboardEntry = { id: userId, name: 'Tu (Ospite)', workouts: 0, badgesCount: 0, rank: 6, isUser: true };
      setLeaderboard([...DEFAULT_LEADERBOARD, userEntry].sort((a,b) => b.workouts - a.workouts).map((x,i)=>({...x, rank: i+1})));
  };

  const handleGuestLogin = async () => {
      setIsLoading(true);
      // Generate a unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save it to localStorage
      localStorage.setItem('gymbro_guest_id', guestId);
      
      // Proceed to load data (which handles initialization)
      await loadUserData(guestId);
  };

  const handleLogoutState = useCallback(() => {
      SecureStorageManager.clearCredentials('access_token');
      localStorage.removeItem('gymbro_guest_id'); // Clear guest session
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

          if (sessionUserId) await revertWorkoutTransaction(sessionUserId, realId, workoutId);

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

  const handleWorkoutComplete = useCallback(async (duration: number, exCount: number, img: string | null, w: WorkoutCard, nextScreen: ScreenName = 'home') => {
      setIsLoading(true);
      try {
          const updatedBadges = userStats.badges; 
          if (sessionUserId) await completeWorkoutTransaction(sessionUserId, w, duration, updatedBadges);

          const finalId = `done_${Date.now()}_${w.id}`;
          const newHistoryEntry = { id: finalId, date: new Date().toISOString().split('T')[0], workoutTitle: w.title, duration: duration, category: w.category };
          const updatedHistory = [newHistoryEntry, ...userStats.workoutHistory];
          
          setUserStats(prev => ({ ...prev, workoutsCompleted: prev.workoutsCompleted + 1, streak: recalculateStreak(updatedHistory), activeMinutes: prev.activeMinutes + Math.floor(duration/60), workoutHistory: updatedHistory }));

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

          setCurrentScreen(nextScreen);
      } catch (error: any) { console.error("Errore Salvataggio:", error); alert("Errore nel salvataggio dei dati."); } finally { setIsLoading(false); }
  }, [userStats, sessionUserId]);

  // --- 5. RENDER ---
  const renderScreen = () => {
    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" size={48} /></div>;
    if (isAppLocked) return <BiometricGate onUnlock={() => setIsAppLocked(false)} isDarkMode={isDarkMode} />;

    switch (currentScreen) {
      case 'login': return <LoginScreen onLogin={(mode, userId) => { if(mode==='guest') { handleGuestLogin(); } else if (userId) { setIsLoading(true); loadUserData(userId); } else { setIsLoading(true); supabase.auth.getSession().then(({data}) => data.session ? loadUserData(data.session.user.id) : setIsLoading(false)); } }} />;
      case 'profile-config': return <ProfileConfigScreen onNext={(d) => { 
          if(sessionUserId && sessionUserId.startsWith('guest_')) updateGuestProfile(d);
          setUserProfile(p=>({...p, ...d})); 
          setCurrentScreen('goal-selection'); 
        }} onSkip={() => {}} />;
      case 'goal-selection': return <GoalSelectionScreen onFinish={(g) => { 
          if(sessionUserId && sessionUserId.startsWith('guest_')) updateGuestProfile({goal: g});
          setUserProfile(p=>({...p, goal: g})); 
          setCurrentScreen('strength-test'); 
        }} />;
      case 'strength-test': return <StrengthTestScreen onNext={(d) => { 
          const safeWeight = parseFloat(d.testWeight.toString());
          const safeReps = parseFloat(d.testReps.toString());
          if(sessionUserId && sessionUserId.startsWith('guest_')) updateGuestProfile({test_exercise: d.testExercise, test_weight: safeWeight, test_reps: safeReps});
          setUserProfile(p=>({...p, testExercise: d.testExercise, testWeight: safeWeight, testReps: safeReps})); 
          setCurrentScreen('plan-generation'); 
      }} />;
      case 'plan-generation': return <PlanGenerationScreen userProfile={userProfile} onPlanGenerated={(w) => { 
          if(sessionUserId && sessionUserId.startsWith('guest_')) updateGuestProfile({current_plan: w});
          setGeneratedWorkouts(w); 
          setUserProfile(p=>({...p, currentPlan: w})); 
          setCurrentScreen('preferences'); 
      }} />;
      case 'preferences': return <PreferencesScreen onNext={(f, days) => { 
          // Note: Persistence handled inside PreferencesScreen now
          setUserProfile(p=>({...p, favoriteExercises: f, trainingDays: days}));
          generateFutureSchedule(generatedWorkouts, days, {});
          setCurrentScreen('home'); 
          setTimeout(()=>setShowCoachMarks(true), 1000); 
      }} />;
      
      case 'home': return <MemoizedHomeScreen onNavigate={setCurrentScreen} userProfile={userProfile} userStats={userStats} availableWorkouts={generatedWorkouts} onStartWorkout={(id)=>{setSelectedWorkoutId(id); setCurrentScreen('workout');}} isDarkMode={isDarkMode} themeColor={themeColor} notifications={notifications} onMarkNotificationsRead={()=>setNotifications(p=>p.map(n=>({...n, read:true})))} />;
      case 'calendar': return <MemoizedCalendarScreen 
          schedule={workoutSchedule} 
          availableWorkouts={generatedWorkouts} 
          onScheduleWorkout={(d,w)=> { const nw = {...w, id: `sched_${Date.now()}_${w.id}`}; setWorkoutSchedule(p=>({...p, [d]:[...(p[d]||[]), nw]})); }} 
          onRemoveWorkout={(date, id)=>{
             const workout = workoutSchedule[date]?.find(w => w.id === id);
             if (workout) handleDeleteWorkout(id);
          }} 
          onStartWorkout={(id)=>{setSelectedWorkoutId(id); setCurrentScreen('workout');}} 
          onNavigateHome={()=>setCurrentScreen('home')} 
          isDarkMode={isDarkMode} 
          themeColor={themeColor} 
      />;
      case 'workout': return <WorkoutDetailScreen onBack={()=>setCurrentScreen('home')} initialWorkoutId={selectedWorkoutId} customWorkouts={generatedWorkouts} onWorkoutComplete={(d, e, i, w, n) => { handleWorkoutComplete(d, e, i, w, n); }} onShareToCommunity={(p)=>setCommunityPosts(pr=>[p, ...pr])} isDarkMode={isDarkMode} userProfile={userProfile} />;
      case 'profile': return <ProfileScreen onLogout={handleLogoutState} userProfile={userProfile} userStats={userStats} isDarkMode={isDarkMode} toggleTheme={()=>setIsDarkMode(!isDarkMode)} onEditProfile={()=>setCurrentScreen('profile-config')} themeColor={themeColor} workoutSchedule={workoutSchedule} onDeleteWorkout={(id, date) => { handleDeleteWorkout(id); }} />;
      case 'community': return <MemoizedCommunityScreen onBack={()=>setCurrentScreen('home')} isDarkMode={isDarkMode} posts={communityPosts} stories={stories} leaderboard={leaderboard} onAddPost={(p)=>setCommunityPosts(pr=>[p, ...pr])} onLikePost={(id)=>setCommunityPosts(p=>p.map(x=>x.id===id?{...x, likes:x.likes+1, liked:true}:x))} onPostComment={()=>{}} userProfile={userProfile} onStartChallenge={(id, name, img, pid, txt)=>{setTempChallengeData(generateSmartChallenge(userStats, name, id, txt)); setSelectedWorkoutId(null); setCurrentScreen('workout');}} onUpdateChallenge={()=>{}} userStats={userStats} challenges={challenges} themeColor={themeColor} />;
      default: return <LoginScreen onLogin={()=>{}} />;
    }
  };

  const showBottomNav = ['calendar', 'community', 'profile'].includes(currentScreen);

  return (
    <>
      {renderScreen()}
      {showCoachMarks && <CoachMarks steps={TUTORIAL_STEPS} onComplete={()=>{setShowCoachMarks(false); localStorage.setItem('hasSeenCoachMarks','true');}} themeColor={themeColor} />}
      {currentScreen!=='login' && showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} isDarkMode={isDarkMode} themeColor={themeColor} />}
    </>
  );
};

export default App;
