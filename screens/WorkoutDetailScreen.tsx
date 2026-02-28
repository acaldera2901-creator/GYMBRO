
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Dumbbell, Flame, Activity, Zap, Timer, ChevronLeft, Play, CheckCircle2, Clock, X, Trophy, StopCircle, Camera, ChevronRight, LayoutDashboard, Minus, Pause, Swords, Trash2, Save, SkipForward, FastForward, Calendar, History } from 'lucide-react';
import { CategoryType, WorkoutCard, Post, UserProfile, ScreenName } from '../types';

interface WorkoutDetailScreenProps {
  onBack: () => void;
  customWorkouts?: WorkoutCard[];
  onWorkoutComplete?: (duration: number, exercises: number, image: string | null, workout: WorkoutCard, nextScreen?: ScreenName) => void;
  initialWorkoutId?: string | null;
  isDarkMode: boolean;
  userProfile?: UserProfile;
  onShareToCommunity?: (post: Post) => void;
  onCreateWorkout?: (workout: WorkoutCard) => void;
}

// --- FULL LIBRARY (20 Schede) ---
const WORKOUTS_DATABASE_DEFAULT: WorkoutCard[] = [
    // --- 1. CATEGORIA: MASSA (Ipertrofia) ---
    {
        id: 'mas_1',
        category: 'Massa',
        title: 'Petto e Tricipiti',
        focus: 'Spinta e Tensione Meccanica',
        exercises: [
            { name: 'Panca Piana Bilanciere', reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Spinte Manubri Inclinata', reps: '3 x 8-10 (Rec. 90")' },
            { name: 'Dip alle Parallele', reps: '3 x 8-10 (Rec. 90")' },
            { name: 'Croci ai Cavi alti', reps: '3 x 12-15 (Rec. 60")' },
            { name: 'French Press Bil. EZ', reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Pushdown Corda', reps: '3 x 12-15 (Rec. 60")' }
        ],
        affinityScore: 100
    },
    {
        id: 'mas_2',
        category: 'Massa',
        title: 'Dorso e Bicipiti',
        focus: 'Trazione e Spessore',
        exercises: [
            { name: 'Trazioni (o Lat Machine)', reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Rematore con Bilanciere', reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Pulley Basso (presa stretta)', reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Pull-over al cavo alto', reps: '3 x 15 (Rec. 60")' },
            { name: 'Curl con Bilanciere', reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Curl a Martello (Hammer)', reps: '3 x 12 (Rec. 60")' }
        ],
        affinityScore: 95
    },
    {
        id: 'mas_3',
        category: 'Massa',
        title: 'Gambe (Focus Quad)',
        focus: 'Volume Arti Inferiori',
        exercises: [
            { name: 'Squat con Bilanciere', reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Leg Press 45°', reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Affondi Bulgari', reps: '3 x 10/lato (Rec. 90")' },
            { name: 'Leg Extension', reps: '4 x 15 (Rec. 60")' },
            { name: 'Calf Raise in piedi', reps: '4 x 15 (Rec. 45")' }
        ],
        affinityScore: 90
    },
    {
        id: 'mas_4',
        category: 'Massa',
        title: 'Spalle & Richiamo Petto',
        focus: 'Deltoidi e Upper Chest',
        exercises: [
            { name: 'Military Press (in piedi)', reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Alzate Laterali Manubri', reps: '4 x 12-15 (Rec. 60")' },
            { name: 'Face Pull (Cavi alti)', reps: '3 x 15 (Rec. 60")' },
            { name: 'Panca Inclinata Manubri', reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Scrollate (Shrugs) Manubri', reps: '3 x 12 (Rec. 60")' }
        ],
        affinityScore: 85
    },
    {
        id: 'mas_5',
        category: 'Massa',
        title: 'Gambe (Focus Posteriore)',
        focus: 'Femorali e Glutei',
        exercises: [
            { name: 'Stacco da Terra Rumeno', reps: '4 x 8 (Rec. 120")' },
            { name: 'Hip Thrust con Bilanciere', reps: '4 x 10 (Rec. 90")' },
            { name: 'Leg Curl Sdraiato', reps: '3 x 12 (Rec. 60")' },
            { name: 'Hyperextension (con peso)', reps: '3 x 15 (Rec. 60")' },
            { name: 'Plank Addominale (zavorrato)', reps: '3 x 60" (Rec. 60")' }
        ],
        affinityScore: 85
    },

    // --- 2. CATEGORIA: DEFINIZIONE ---
    {
        id: 'def_1',
        category: 'Definizione',
        title: 'Upper Body Supersets',
        focus: 'Densità Spinta/Trazione',
        exercises: [
            { name: 'SS: Panca Piana + Rematore Bil.', reps: '4 x 10+10 (Rec. 90")' },
            { name: 'SS: Military Press + Lat Machine', reps: '3 x 12+12 (Rec. 75")' },
            { name: 'SS: Alzate Laterali + Face Pull', reps: '3 x 15+15 (Rec. 60")' },
            { name: 'SS: French Press + Curl Bilanciere', reps: '3 x 12+12 (Rec. 60")' }
        ],
        affinityScore: 95
    },
    {
        id: 'def_2',
        category: 'Definizione',
        title: 'Gambe Alta Intensità',
        focus: 'Gambe e Cardio',
        exercises: [
            { name: 'Goblet Squat', reps: '4 x 15 (Rec. 60")' },
            { name: 'SS: Affondi camminati + Leg Curl', reps: '3 x 20+12 (Rec. 90")' },
            { name: 'SS: Leg Extension + Calf Press', reps: '3 x 15+20 (Rec. 60")' },
            { name: 'Mountain Climbers', reps: '4 x 30" (Rec. 30")' }
        ],
        affinityScore: 90
    },
    {
        id: 'def_3',
        category: 'Definizione',
        title: 'Full Body Circuit A',
        focus: 'No Pausa (4 Giri)',
        exercises: [
            { name: '1. Stacco da terra', reps: '10 reps' },
            { name: '2. Push Up', reps: 'Max reps' },
            { name: '3. Box Jump (o Step Up)', reps: '15 reps' },
            { name: '4. Rematore Manubrio', reps: '10 reps' },
            { name: '5. Plank', reps: '45 sec' }
        ],
        affinityScore: 85
    },
    {
        id: 'def_4',
        category: 'Definizione',
        title: 'Deltoidi e Braccia (Pumping)',
        focus: 'Volume Braccia e Spalle',
        exercises: [
            { name: 'Arnold Press', reps: '4 x 12 (Rec. 60")' },
            { name: 'Triset: Alzate Lat. + Front. + Post.', reps: '3 x 10+10+10 (Rec. 90")' },
            { name: 'SS: Pushdown fune + Hammer Curl', reps: '4 x 15+15 (Rec. 45")' },
            { name: 'Dip tra panche', reps: '3 x Max (Rec. 45")' }
        ],
        affinityScore: 85
    },
    {
        id: 'def_5',
        category: 'Definizione',
        title: 'Full Body Lattacido B',
        focus: 'Acido Lattico',
        exercises: [
            { name: 'Leg Press', reps: '4 x 20 (Rec. 60")' },
            { name: 'Chest Press Machine', reps: '4 x 15 (Rec. 45")' },
            { name: 'Lat Machine Inversa', reps: '4 x 15 (Rec. 45")' },
            { name: 'Crunch a terra', reps: '4 x 20 (Rec. 30")' },
            { name: 'Burpees', reps: '3 x 10 (Rec. 60")' }
        ],
        affinityScore: 80
    },

    // --- 3. CATEGORIA: PERDITA PESO ---
    {
        id: 'fat_1',
        category: 'Perdita Peso',
        title: 'PHA Basic',
        focus: 'Peripheral Heart Action',
        exercises: [
            { name: 'Squat Libero', reps: '4 x 15 (No Rec.)' },
            { name: 'Military Press Manubri', reps: '4 x 12 (Rec. 60")' },
            { name: 'Affondi Dietro', reps: '3 x 12 (No Rec.)' },
            { name: 'Lat Machine avanti', reps: '3 x 12 (Rec. 60")' },
            { name: 'Crunch Bicicletta', reps: '3 x 30" (Rec. 30")' }
        ],
        affinityScore: 90
    },
    {
        id: 'fat_2',
        category: 'Perdita Peso',
        title: 'Functional Fat Burn',
        focus: 'Metabolico Funzionale',
        exercises: [
            { name: 'Kettlebell Swing', reps: '5 x 20 (Rec. 45")' },
            { name: 'Thruster (Squat + Press)', reps: '4 x 12 (Rec. 60")' },
            { name: 'Renegade Row', reps: '4 x 8/lato (Rec. 45")' },
            { name: 'Jumping Jacks', reps: '4 x 60" (Rec. 30")' }
        ],
        affinityScore: 90
    },
    {
        id: 'fat_3',
        category: 'Perdita Peso',
        title: 'PHA Advanced',
        focus: 'Alta Intensità PHA',
        exercises: [
            { name: 'Stacco Rumeno Manubri', reps: '4 x 12 (No Rec.)' },
            { name: 'Panca Piana Manubri', reps: '4 x 12 (Rec. 60")' },
            { name: 'Step-Up su box', reps: '3 x 15 (No Rec.)' },
            { name: 'Pulley Basso', reps: '3 x 15 (Rec. 60")' },
            { name: 'Plank Jacks', reps: '3 x 40" (Rec. 30")' }
        ],
        affinityScore: 85
    },
    {
        id: 'fat_4',
        category: 'Perdita Peso',
        title: 'Cardio Complex (Barbell)',
        focus: '4 Giri - Senza posare il bilanciere',
        exercises: [
            { name: '1. Stacco da terra', reps: '8 reps' },
            { name: '2. Rematore', reps: '8 reps' },
            { name: '3. Front Squat', reps: '8 reps' },
            { name: '4. Military Press', reps: '8 reps (Rec. 90" fine giro)' }
        ],
        affinityScore: 85
    },
    {
        id: 'fat_5',
        category: 'Perdita Peso',
        title: 'Bodyweight HIIT',
        focus: '30s Lavoro / 15s Riposo (6 Giri)',
        exercises: [
            { name: 'Burpees', reps: '30 sec' },
            { name: 'Squat Jump', reps: '30 sec' },
            { name: 'Push Up', reps: '30 sec' },
            { name: 'Sit Ups', reps: '30 sec' }
        ],
        affinityScore: 80
    },

    // --- 4. CATEGORIA: RESISTENZA ---
    {
        id: 'res_1',
        category: 'Resistenza',
        title: 'Upper Body Endurance',
        focus: 'Alte Ripetizioni',
        exercises: [
            { name: 'Piegamenti (Push Up)', reps: '3 x Max (Rec. 45")' },
            { name: 'Lat Machine', reps: '3 x 20-25 (Rec. 45")' },
            { name: 'Chest Press', reps: '3 x 20-25 (Rec. 45")' },
            { name: 'Alzate Laterali', reps: '3 x 30 (Rec. 30")' },
            { name: 'Curl Bicipiti Cavi', reps: '3 x 30 (Rec. 30")' }
        ],
        affinityScore: 90
    },
    {
        id: 'res_2',
        category: 'Resistenza',
        title: 'Lower Body Endurance',
        focus: 'Resistenza Gambe',
        exercises: [
            { name: 'Squat a corpo libero', reps: '4 x 50 (Rec. 60")' },
            { name: 'Affondi camminati', reps: '3 x 3 min (Rec. 60")' },
            { name: 'Leg Extension', reps: '3 x 30 (Rec. 45")' },
            { name: 'Leg Curl', reps: '3 x 30 (Rec. 45")' },
            { name: 'Calf alla pressa', reps: '3 x 50 (Rec. 30")' }
        ],
        affinityScore: 85
    },
    {
        id: 'res_3',
        category: 'Resistenza',
        title: 'Isometrica e Core',
        focus: 'Tenuta Statica',
        exercises: [
            { name: 'Wall Sit (Sedia al muro)', reps: '4 x Max (Rec. 60")' },
            { name: 'Plank', reps: '4 x Max (Rec. 60")' },
            { name: 'Hollow Body Position', reps: '4 x 45" (Rec. 45")' },
            { name: 'Superman Hold (Lombari)', reps: '4 x 45" (Rec. 45")' }
        ],
        affinityScore: 85
    },
    {
        id: 'res_4',
        category: 'Resistenza',
        title: 'Circuito "100 Reps"',
        focus: 'Volume Totale',
        exercises: [
            { name: 'Leg Press', reps: '100 Totali (Minori serie possibili)' },
            { name: 'Pulley Basso', reps: '100 Totali (Minori serie possibili)' },
            { name: 'Shoulder Press Macchina', reps: '100 Totali (Minori serie possibili)' }
        ],
        affinityScore: 80
    },
    {
        id: 'res_5',
        category: 'Resistenza',
        title: 'Cardio-Resistenza Mista',
        focus: 'Endurance Funzionale',
        exercises: [
            { name: 'Vogatore', reps: '3 x 500m (Rec. 60")' },
            { name: 'Kettlebell Swing', reps: '3 x 40 (Rec. 60")' },
            { name: 'Box Jump', reps: '3 x 20 (Rec. 60")' },
            { name: 'Farmer Walk (Camminata con pesi)', reps: '3 x 40m (Rec. 60")' }
        ],
        affinityScore: 80
    }
];

const CATEGORY_INFO: Record<CategoryType, { color: string, icon: React.ElementType, desc: string, sub: string, imageMen: string, imageWomen: string, restSeconds: number }> = {
    'Massa': { color: 'emerald', icon: Dumbbell, desc: '3 giri • Recupero 90"', sub: 'Muscle Gain', imageMen: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop', imageWomen: 'https://images.unsplash.com/photo-1522898467493-49726bf28798?q=80&w=2070&auto=format&fit=crop', restSeconds: 90 },
    'Definizione': { color: 'violet', icon: Zap, desc: '4 giri • Recupero 45"', sub: 'Shredded & Toned', imageMen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop', imageWomen: 'https://images.unsplash.com/photo-1609643002902-1063f5de5b21?q=80&w=2070&auto=format&fit=crop', restSeconds: 45 },
    'Perdita Peso': { color: 'orange', icon: Flame, desc: 'AMRAP • Rec. Attivo', sub: 'Fat Burn', imageMen: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', imageWomen: 'https://images.unsplash.com/photo-1574680096141-9877b4544b7d?q=80&w=2070&auto=format&fit=crop', restSeconds: 30 },
    'Resistenza': { color: 'blue', icon: Activity, desc: 'Recupero 60"', sub: 'Endurance', imageMen: 'https://images.unsplash.com/photo-1517963879466-e825c6329090?q=80&w=2070&auto=format&fit=crop', imageWomen: 'https://images.unsplash.com/photo-1538805060504-630c9368c375?q=80&w=2070&auto=format&fit=crop', restSeconds: 60 }
};

const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({ 
    onBack, customWorkouts, onWorkoutComplete, initialWorkoutId, isDarkMode, userProfile, onCreateWorkout, onShareToCommunity
}) => {
  const activeDatabase = customWorkouts && customWorkouts.length > 0 ? customWorkouts : WORKOUTS_DATABASE_DEFAULT;
  const hasWorkouts = activeDatabase.length > 0;
  
  const defaultCategory: CategoryType = hasWorkouts ? activeDatabase[0].category : 'Massa';
  const gender = userProfile?.gender === 'Donna' ? 'Donna' : 'Uomo';

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(defaultCategory);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutCard | null>(null);
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());

  const [isResting, setIsResting] = useState(false);
  const [isRestPaused, setIsRestPaused] = useState(false); 
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0); 
  const [showRecap, setShowRecap] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const startTimeRef = useRef<number>(0);

  const theme = {
      bg: isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]',
      text: isDarkMode ? 'text-white' : 'text-black',
      textSub: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
      card: isDarkMode ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-black/5 shadow-sm',
      navBtn: isDarkMode ? 'bg-[#2c2c2e] text-white' : 'bg-white text-black shadow-sm',
  };

  useEffect(() => {
    if (initialWorkoutId && hasWorkouts) {
        let found: WorkoutCard | undefined = activeDatabase.find(w => w.id === initialWorkoutId);

        // Handle scheduled workouts with prefixed IDs
        if (!found && initialWorkoutId.startsWith('sched_')) {
            const parts = initialWorkoutId.split('_');
            if (parts.length > 2) {
                const originalId = parts.slice(2).join('_');
                found = activeDatabase.find(w => w.id === originalId);
            }
        }

        if (found) {
            setActiveWorkout(found);
            setSelectedCategory(found.category);
            
            // If it's a scheduled workout, start the session immediately
            if (initialWorkoutId.startsWith('sched_')) {
                setIsSessionActive(true);
            }
        }
    }
  }, [initialWorkoutId, activeDatabase, hasWorkouts]);

  const { filteredWorkouts, displayWorkouts } = useMemo(() => {
      const filtered = activeDatabase.filter(w => w.category === selectedCategory);
      return { 
          filteredWorkouts: filtered,
          displayWorkouts: filtered.length > 0 ? filtered : activeDatabase
      };
  }, [activeDatabase, selectedCategory]);

  const currentInfo = CATEGORY_INFO[selectedCategory] || CATEGORY_INFO['Massa'];
  const currentHeroImage = gender === 'Donna' ? currentInfo.imageWomen : currentInfo.imageMen;

  useEffect(() => {
    let interval: any;
    
    if (isSessionActive && startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
    }

    if (isSessionActive) {
        interval = setInterval(() => {
            const now = Date.now();
            const delta = Math.floor((now - startTimeRef.current) / 1000);
            setElapsedSeconds(delta);
        }, 1000);
    } else {
        startTimeRef.current = 0;
    }
    
    if (isSessionActive && isResting && !isRestPaused) {
        const restInterval = setInterval(() => {
            setRestTimeRemaining(p => {
                if (p <= 1) { 
                    setIsResting(false); 
                    return 0; 
                }
                return p - 1;
            });
        }, 1000);
        return () => { clearInterval(interval); clearInterval(restInterval); }
    }

    return () => clearInterval(interval);
  }, [isSessionActive, isResting, isRestPaused]);

  const handleSetCompletion = (exIdx: number, setIdx: number) => {
      const key = `${exIdx}-${setIdx}`;
      const isAlreadyCompleted = completedSets.has(key);
      
      setCompletedSets(prev => {
          const newSet = new Set(prev);
          if (newSet.has(key)) {
              newSet.delete(key);
          } else {
              newSet.add(key);
          }
          return newSet;
      });

      if (!isAlreadyCompleted) {
          const duration = CATEGORY_INFO[activeWorkout!.category]?.restSeconds || 60;
          setTotalRestTime(duration); 
          setRestTimeRemaining(duration); 
          setIsResting(true);
          setIsRestPaused(false);
      }
  };

  const endSession = () => { setIsSessionActive(false); setShowRecap(true); };
  
  const finishAndShare = () => {
      if (!activeWorkout) return;
      
      if (onShareToCommunity && customImage) {
          const newPost: Post = {
              id: `post_${Date.now()}`,
              userId: userProfile?.id || '',
              user: userProfile?.name || 'Utente',
              userImage: userProfile?.image,
              time: 'Adesso',
              content: `Ho appena completato ${activeWorkout.title} in ${Math.floor(elapsedSeconds / 60)} minuti! 🔥`,
              image: customImage,
              tag: 'Allenamento',
              likes: 0,
              comments: 0,
              liked: false
          };
          onShareToCommunity(newPost);
      }

      if (onWorkoutComplete) {
          const nextScreen = (onShareToCommunity && customImage) ? 'community' : 'home';
          onWorkoutComplete(elapsedSeconds, 5, customImage, activeWorkout, nextScreen);
      }
      
      setShowRecap(false); 
      setActiveWorkout(null); 
      setElapsedSeconds(0); 
      setCompletedSets(new Set());
      startTimeRef.current = 0;
  };

  if (isSessionActive && activeWorkout) {
      if (isResting) {
          const progress = totalRestTime > 0 ? ((totalRestTime - restTimeRemaining) / totalRestTime) : 0;
          const circumference = 2 * Math.PI * 120; // r=120
          const strokeDashoffset = circumference * progress;

          return (
              <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between pb-12 pt-safe px-6 animate-in fade-in duration-300">
                  <div className="w-full flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                         <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">Recupero</span>
                      </div>
                      <button onClick={() => setIsResting(false)} className="text-zinc-500 font-bold text-sm hover:text-white">Chiudi</button>
                  </div>

                  <div className="relative flex items-center justify-center">
                      <svg className="w-[300px] h-[300px] transform -rotate-90">
                          <circle cx="150" cy="150" r="120" stroke="#1c1c1e" strokeWidth="12" fill="none" />
                          <circle cx="150" cy="150" r="120" stroke="#f97316" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums">
                              {Math.floor(restTimeRemaining / 60)}:{String(restTimeRemaining % 60).padStart(2,'0')}
                          </span>
                      </div>
                  </div>

                  <div className="flex items-center gap-8 mb-8">
                      <button onClick={() => setRestTimeRemaining(prev => prev + 30)} className="w-16 h-16 rounded-full bg-zinc-900 text-white flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors border border-zinc-800">
                          <span className="text-xs font-bold">+30</span>
                          <span className="text-[10px] text-zinc-500">sec</span>
                      </button>
                      <button onClick={() => setIsRestPaused(!isRestPaused)} className="w-24 h-24 rounded-full bg-orange-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                          {isRestPaused ? <Play fill="currentColor" size={32} /> : <Pause fill="currentColor" size={32} />}
                      </button>
                      <button onClick={() => setIsResting(false)} className="w-16 h-16 rounded-full bg-zinc-900 text-white flex flex-col items-center justify-center hover:bg-zinc-800 transition-colors border border-zinc-800">
                          <FastForward size={24} fill="currentColor" className="ml-1"/>
                          <span className="text-[10px] text-zinc-500 mt-1">Salta</span>
                      </button>
                  </div>
              </div>
          );
      }

      return (
          <div className="min-h-screen bg-black text-white flex flex-col relative">
              <div className="fixed top-0 left-0 right-0 z-20 pt-safe px-5 pb-4 bg-black/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center transition-all">
                  <div>
                      <h2 className="text-lg font-bold text-white leading-tight max-w-[200px] truncate">{activeWorkout.title}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                          <div className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`}></div>
                          <span className="text-emerald-500 font-mono text-sm font-medium">
                              {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2,'0')}
                          </span>
                      </div>
                  </div>
                  <button onClick={endSession} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 border border-red-500/20 transition-colors">Termina</button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-5 pt-28 pb-32 space-y-4">
                  {activeWorkout.exercises.map((ex, idx) => {
                      const setsCompleted = Array.from({length: 3}).filter((_, si) => completedSets.has(`${idx}-${si}`)).length;
                      const isFullyDone = setsCompleted === 3;
                      return (
                          <div key={idx} className={`rounded-[1.5rem] p-5 border transition-all duration-300 ${isFullyDone ? 'bg-zinc-900/50 border-white/5 opacity-60' : 'bg-[#1c1c1e] border-white/10 shadow-lg'}`}>
                              <div className="flex justify-between items-start mb-5">
                                  <div>
                                    <h3 className={`text-xl font-bold ${isFullyDone ? 'text-zinc-500' : 'text-white'}`}>{ex.name}</h3>
                                    <p className="text-zinc-500 text-xs font-medium uppercase mt-1 tracking-wide">{ex.reps}</p>
                                  </div>
                                  {isFullyDone && <div className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded-full"><CheckCircle2 size={16}/></div>}
                              </div>
                              <div className="flex gap-2.5">
                                  {Array.from({length: 3}).map((_, setIdx) => {
                                      const isDone = completedSets.has(`${idx}-${setIdx}`);
                                      return (
                                          <button key={setIdx} onClick={() => handleSetCompletion(idx, setIdx)} className={`flex-1 h-12 rounded-lg font-bold flex items-center justify-center transition-all duration-200 text-sm ${isDone ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                                              {isDone ? <CheckCircle2 size={20} /> : `Set ${setIdx + 1}`}
                                          </button>
                                      )
                                  })}
                              </div>
                          </div>
                      );
                  })}
                  <div className="h-10"></div>
              </div>
          </div>
      )
  }

  if (showRecap) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <Trophy size={56} className="text-yellow-500 mb-6 animate-bounce" />
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight text-center">Allenamento Concluso!</h1>
              <p className="text-zinc-400 mb-8 text-center text-sm">Tempo totale: {Math.floor(elapsedSeconds / 60)} minuti</p>
              
              <div className="w-full max-w-sm aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden relative mb-6 border border-white/10 group shadow-2xl">
                  {customImage ? (
                      <>
                        <img src={customImage} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                             <h3 className="font-bold text-lg">{activeWorkout?.title}</h3>
                             <p className="text-xs text-zinc-300">{new Date().toLocaleDateString()}</p>
                        </div>
                      </>
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-[#1c1c1e]">
                          <Camera size={48} className="mb-2 opacity-50" />
                          <span className="font-bold text-xl">SCATTA FOTO</span>
                      </div>
                  )}
                  
                  <button onClick={() => fileInputRef.current?.click()} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/70 transition-colors z-20">
                      <Camera size={24}/>
                  </button>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) { const r = new FileReader(); r.onload = () => setCustomImage(r.result as string); r.readAsDataURL(file); }
                    }} 
                  />
              </div>

              <div className="w-full max-w-sm flex gap-3 mb-6">
                  <div className={`flex-1 rounded-xl p-3 flex flex-col items-center justify-center text-center border transition-colors ${customImage ? 'bg-[#1c1c1e] border-white/5' : 'bg-transparent border-transparent opacity-50'}`}>
                       <History size={20} className="text-blue-500 mb-1" />
                       <span className="text-[10px] text-zinc-400 uppercase font-bold">Community</span>
                       <span className="text-xs text-white">Feed Pubblico</span>
                  </div>
                  <div className="flex-1 bg-[#1c1c1e] rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/5">
                       <Calendar size={20} className="text-emerald-500 mb-1" />
                       <span className="text-[10px] text-zinc-400 uppercase font-bold">Calendario</span>
                       <span className="text-xs text-white">Salvataggio</span>
                  </div>
              </div>

              <button 
                onClick={finishAndShare} 
                className="w-full max-w-sm py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-white/10"
              >
                  {customImage ? <CheckCircle2 size={20} /> : <Save size={20} />}
                  {customImage ? 'Condividi e Salva' : 'Salva senza Foto'}
              </button>
          </div>
      )
  }

  if (!activeWorkout) {
      return (
        <div className={`min-h-screen ${theme.bg} pb-32 transition-colors duration-500`}>
            <div className="px-6 pt-14 pb-4 flex justify-between items-center">
                <button onClick={onBack} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.navBtn}`}><ChevronLeft size={24} /></button>
                <h1 className={`text-lg font-bold ${theme.text}`}>Libreria</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mb-8">
                <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden relative shadow-2xl group cursor-pointer" onClick={() => { if(displayWorkouts[0]) setActiveWorkout(displayWorkouts[0]); }}>
                    <img src={currentHeroImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                        <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">In Evidenza</span>
                        <h2 className="text-white text-3xl font-bold leading-none mb-1">{selectedCategory}</h2>
                        <p className="text-zinc-300 text-sm font-medium">{currentInfo.sub}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto px-6 pb-6 scrollbar-hide">
                {(Object.keys(CATEGORY_INFO) as CategoryType[]).map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-white text-black shadow-lg' : 'bg-zinc-800 text-zinc-400'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="px-6 space-y-4">
                <h3 className={`text-xl font-bold ${theme.text}`}>Tutti i piani</h3>
                {displayWorkouts.map((w) => (
                    <div key={w.id} onClick={() => setActiveWorkout(w)} className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer active:scale-98 transition-transform ${theme.card}`}>
                        <div className={`w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600`}>
                            <Dumbbell size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold ${theme.text} truncate`}>{w.title}</h4>
                            <p className={`text-xs ${theme.textSub} mt-0.5`}>{w.exercises.length} Esercizi • 45 Min</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDarkMode ? 'border-zinc-700 text-zinc-500' : 'border-zinc-200'}`}>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                ))}
                {displayWorkouts.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Dumbbell size={32} className="mx-auto mb-2 text-zinc-500" />
                        <p className={`text-sm ${theme.textSub}`}>Nessun piano disponibile.</p>
                    </div>
                )}
            </div>
        </div>
      )
  }

  return (
      <div className={`min-h-screen ${theme.bg} pb-24`}>
          <div className="relative h-[50vh]">
              <img src={gender === 'Donna' ? CATEGORY_INFO[activeWorkout.category].imageWomen : CATEGORY_INFO[activeWorkout.category].imageMen} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <button onClick={() => setActiveWorkout(null)} className="absolute top-14 left-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center"><ChevronLeft size={24}/></button>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-4xl font-extrabold text-white mb-2 leading-none">{activeWorkout.title}</h1>
                  <p className="text-zinc-300 font-medium text-lg">{activeWorkout.focus}</p>
                  <div className="flex gap-4 mt-4">
                      <button onClick={() => setIsSessionActive(true)} className="flex-1 bg-emerald-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Play fill="currentColor" size={20}/> INIZIA</button>
                  </div>
              </div>
          </div>

          <div className="px-6 py-8 bg-black">
              <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Lista Esercizi</h3>
              <div className="space-y-6">
                  {activeWorkout.exercises.map((ex, i) => (
                      <div key={i} className="flex items-start gap-4">
                          <span className="text-zinc-600 font-bold text-lg w-6">{i+1}</span>
                          <div className="flex-1 border-b border-zinc-800 pb-6">
                              <p className="text-white font-bold text-lg">{ex.name}</p>
                              <p className="text-emerald-500 text-sm font-mono mt-1">{ex.reps}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

export default WorkoutDetailScreen;
