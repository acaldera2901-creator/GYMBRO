
import React, { useEffect, useState } from 'react';
import { UserProfile, WorkoutCard } from '../types';
import { BrainCircuit, CheckCircle2, Calculator } from 'lucide-react';

interface PlanGenerationScreenProps {
  userProfile: UserProfile & { knownMaxes?: { bench: number | null; squat: number | null; deadlift: number | null } };
  onPlanGenerated: (workouts: WorkoutCard[], calculatedMaxes: { bench: number; squat: number; deadlift: number }) => void;
}

// --- DATABASE TEMPLATE (20 Schede - Struttura Base) ---
// Nota: I carichi verranno sovrascritti dall'algoritmo
const TEMPLATES_SOURCE: Record<string, WorkoutCard[]> = {
  'muscle': [
    { 
        id: 't_m1', category: 'Massa', title: 'Petto e Tricipiti', focus: 'Spinta e Tensione', 
        exercises: [
            { name: 'Panca Piana Bilanciere', reps: '4 x 6-8' },
            { name: 'Spinte Manubri Inclinata', reps: '3 x 8-10' },
            { name: 'Dip alle Parallele', reps: '3 x 8-10' },
            { name: 'Croci ai Cavi alti', reps: '3 x 12-15' },
            { name: 'French Press Bil. EZ', reps: '4 x 8-10' },
            { name: 'Pushdown Corda', reps: '3 x 12-15' }
        ], affinityScore: 0 
    },
    { 
        id: 't_m2', category: 'Massa', title: 'Dorso e Bicipiti', focus: 'Trazione e Spessore', 
        exercises: [
            { name: 'Trazioni (o Lat Machine)', reps: '4 x 6-8' },
            { name: 'Rematore con Bilanciere', reps: '4 x 8-10' },
            { name: 'Pulley Basso (presa stretta)', reps: '3 x 10-12' },
            { name: 'Pull-over al cavo alto', reps: '3 x 15' },
            { name: 'Curl con Bilanciere', reps: '4 x 8-10' },
            { name: 'Curl a Martello (Hammer)', reps: '3 x 12' }
        ], affinityScore: 0 
    },
    { 
        id: 't_m3', category: 'Massa', title: 'Gambe (Focus Quad)', focus: 'Volume Arti Inferiori', 
        exercises: [
            { name: 'Squat con Bilanciere', reps: '4 x 6-8' },
            { name: 'Leg Press 45°', reps: '3 x 10-12' },
            { name: 'Affondi Bulgari', reps: '3 x 10/lato' },
            { name: 'Leg Extension', reps: '4 x 15' },
            { name: 'Calf Raise in piedi', reps: '4 x 15' }
        ], affinityScore: 0 
    },
    { 
        id: 't_m4', category: 'Massa', title: 'Spalle & Richiamo Petto', focus: 'Deltoidi e Upper Chest', 
        exercises: [
            { name: 'Military Press (in piedi)', reps: '4 x 6-8' },
            { name: 'Alzate Laterali Manubri', reps: '4 x 12-15' },
            { name: 'Face Pull (Cavi alti)', reps: '3 x 15' },
            { name: 'Panca Inclinata Manubri', reps: '3 x 10-12' },
            { name: 'Scrollate (Shrugs) Manubri', reps: '3 x 12' }
        ], affinityScore: 0 
    },
    { 
        id: 't_m5', category: 'Massa', title: 'Gambe (Focus Posteriore)', focus: 'Femorali e Glutei', 
        exercises: [
            { name: 'Stacco da Terra Rumeno', reps: '4 x 8' },
            { name: 'Hip Thrust con Bilanciere', reps: '4 x 10' },
            { name: 'Leg Curl Sdraiato', reps: '3 x 12' },
            { name: 'Hyperextension (con peso)', reps: '3 x 15' },
            { name: 'Plank Addominale (zavorrato)', reps: '3 x 60"' }
        ], affinityScore: 0 
    }
  ],
  'definition': [
    { 
        id: 't_d1', category: 'Definizione', title: 'Upper Body Supersets', focus: 'Densità Spinta/Trazione', 
        exercises: [
            { name: 'SS: Panca Piana + Rematore Bil.', reps: '4 x 10+10' },
            { name: 'SS: Military Press + Lat Machine', reps: '3 x 12+12' },
            { name: 'SS: Alzate Laterali + Face Pull', reps: '3 x 15+15' },
            { name: 'SS: French Press + Curl Bilanciere', reps: '3 x 12+12' }
        ], affinityScore: 0 
    },
    { 
        id: 't_d2', category: 'Definizione', title: 'Gambe Alta Intensità', focus: 'Gambe e Cardio', 
        exercises: [
            { name: 'Goblet Squat', reps: '4 x 15' },
            { name: 'SS: Affondi camminati + Leg Curl', reps: '3 x 20+12' },
            { name: 'SS: Leg Extension + Calf Press', reps: '3 x 15+20' },
            { name: 'Mountain Climbers', reps: '4 x 30 sec' }
        ], affinityScore: 0 
    },
    { 
        id: 't_d3', category: 'Definizione', title: 'Full Body Circuit A', focus: 'No Pausa (4 Giri)', 
        exercises: [
            { name: '1. Stacco da terra', reps: '10 reps' },
            { name: '2. Push Up', reps: 'Max reps' },
            { name: '3. Box Jump (o Step Up)', reps: '15 reps' },
            { name: '4. Rematore Manubrio', reps: '10 reps' },
            { name: '5. Plank', reps: '45 sec' }
        ], affinityScore: 0 
    },
    { 
        id: 't_d4', category: 'Definizione', title: 'Deltoidi e Braccia (Pumping)', focus: 'Volume Braccia e Spalle', 
        exercises: [
            { name: 'Arnold Press', reps: '4 x 12' },
            { name: 'Triset: Alzate Lat. + Front. + Post.', reps: '3 x 10+10+10' },
            { name: 'SS: Pushdown fune + Hammer Curl', reps: '4 x 15+15' },
            { name: 'Dip tra panche', reps: '3 x Max' }
        ], affinityScore: 0 
    },
    { 
        id: 't_d5', category: 'Definizione', title: 'Full Body Lattacido B', focus: 'Acido Lattico', 
        exercises: [
            { name: 'Leg Press', reps: '4 x 20' },
            { name: 'Chest Press Machine', reps: '4 x 15' },
            { name: 'Lat Machine Inversa', reps: '4 x 15' },
            { name: 'Crunch a terra', reps: '4 x 20' },
            { name: 'Burpees', reps: '3 x 10' }
        ], affinityScore: 0 
    }
  ],
  'weight_loss': [
    { 
        id: 't_w1', category: 'Perdita Peso', title: 'PHA Basic', focus: 'Peripheral Heart Action', 
        exercises: [
            { name: 'Squat Libero', reps: '4 x 15' },
            { name: 'Military Press Manubri', reps: '4 x 12' },
            { name: 'Affondi Dietro', reps: '3 x 12' },
            { name: 'Lat Machine avanti', reps: '3 x 12' },
            { name: 'Crunch Bicicletta', reps: '3 x 30"' }
        ], affinityScore: 0 
    },
    { 
        id: 't_w2', category: 'Perdita Peso', title: 'Functional Fat Burn', focus: 'Metabolico Funzionale', 
        exercises: [
            { name: 'Kettlebell Swing', reps: '5 x 20' },
            { name: 'Thruster (Squat + Press)', reps: '4 x 12' },
            { name: 'Renegade Row', reps: '4 x 8/lato' },
            { name: 'Jumping Jacks', reps: '4 x 60 sec' }
        ], affinityScore: 0 
    },
    { 
        id: 't_w3', category: 'Perdita Peso', title: 'PHA Advanced', focus: 'Alta Intensità PHA', 
        exercises: [
            { name: 'Stacco Rumeno Manubri', reps: '4 x 12' },
            { name: 'Panca Piana Manubri', reps: '4 x 12' },
            { name: 'Step-Up su box', reps: '3 x 15' },
            { name: 'Pulley Basso', reps: '3 x 15' },
            { name: 'Plank Jacks', reps: '3 x 40"' }
        ], affinityScore: 0 
    },
    { 
        id: 't_w4', category: 'Perdita Peso', title: 'Cardio Complex (Barbell)', focus: 'Complex (No Pause)', 
        exercises: [
            { name: '1. Stacco da terra', reps: '8 reps' },
            { name: '2. Rematore', reps: '8 reps' },
            { name: '3. Front Squat', reps: '8 reps' },
            { name: '4. Military Press', reps: '8 reps' }
        ], affinityScore: 0 
    },
    { 
        id: 't_w5', category: 'Perdita Peso', title: 'Bodyweight HIIT', focus: '30s Work / 15s Rest', 
        exercises: [
            { name: 'Burpees', reps: '30 sec' },
            { name: 'Squat Jump', reps: '30 sec' },
            { name: 'Push Up', reps: '30 sec' },
            { name: 'Sit Ups', reps: '30 sec' }
        ], affinityScore: 0 
    }
  ],
  'endurance': [
    { 
        id: 't_e1', category: 'Resistenza', title: 'Upper Body Endurance', focus: 'Alte Ripetizioni', 
        exercises: [
            { name: 'Piegamenti (Push Up)', reps: '3 x Max' },
            { name: 'Lat Machine', reps: '3 x 20-25' },
            { name: 'Chest Press', reps: '3 x 20-25' },
            { name: 'Alzate Laterali', reps: '3 x 30' },
            { name: 'Curl Bicipiti Cavi', reps: '3 x 30' }
        ], affinityScore: 0 
    },
    { 
        id: 't_e2', category: 'Resistenza', title: 'Lower Body Endurance', focus: 'Resistenza Gambe', 
        exercises: [
            { name: 'Squat a corpo libero', reps: '4 x 50' },
            { name: 'Affondi camminati', reps: '3 x 3 min' },
            { name: 'Leg Extension', reps: '3 x 30' },
            { name: 'Leg Curl', reps: '3 x 30' },
            { name: 'Calf alla pressa', reps: '3 x 50' }
        ], affinityScore: 0 
    },
    { 
        id: 't_e3', category: 'Resistenza', title: 'Isometrica e Core', focus: 'Tenuta Statica', 
        exercises: [
            { name: 'Wall Sit (Sedia al muro)', reps: '4 x Max' },
            { name: 'Plank', reps: '4 x Max' },
            { name: 'Hollow Body Position', reps: '4 x 45"' },
            { name: 'Superman Hold (Lombari)', reps: '4 x 45"' }
        ], affinityScore: 0 
    },
    { 
        id: 't_e4', category: 'Resistenza', title: 'Circuito "100 Reps"', focus: 'Volume Totale', 
        exercises: [
            { name: 'Leg Press', reps: '100 Totali' },
            { name: 'Pulley Basso', reps: '100 Totali' },
            { name: 'Shoulder Press Macchina', reps: '100 Totali' }
        ], affinityScore: 0 
    },
    { 
        id: 't_e5', category: 'Resistenza', title: 'Cardio-Resistenza Mista', focus: 'Endurance Funzionale', 
        exercises: [
            { name: 'Vogatore', reps: '3 x 500m' },
            { name: 'Kettlebell Swing', reps: '3 x 40' },
            { name: 'Box Jump', reps: '3 x 20' },
            { name: 'Farmer Walk (Camminata con pesi)', reps: '3 x 40m' }
        ], affinityScore: 0 
    }
  ]
};

// Copy for both genders for now, can be specialized later
const WORKOUT_TEMPLATES_MEN = TEMPLATES_SOURCE;
const WORKOUT_TEMPLATES_WOMEN = TEMPLATES_SOURCE;

// --- LOGICA DI PROPORZIONE CARICHI (Ratio Map) ---
// Base: bench (Panca), squat, deadlift (Stacco)
// Ratio: Percentuale del massimale dell'esercizio base
const EXERCISE_RATIOS: Record<string, { base: 'bench' | 'squat' | 'deadlift', ratio: number }> = {
    'Panca Piana': { base: 'bench', ratio: 1.0 },
    'Panca Piana Bilanciere': { base: 'bench', ratio: 1.0 },
    'SS: Panca Piana': { base: 'bench', ratio: 0.8 }, // Lower for superset
    'Spinte Manubri Inclinata': { base: 'bench', ratio: 0.7 },
    'Panca Inclinata Manubri': { base: 'bench', ratio: 0.7 },
    'Dip alle Parallele': { base: 'bench', ratio: 0.40 },  // Peso aggiunto ai dip ≈ 40% bench (era 0.9: impossibile)
    'Dip': { base: 'bench', ratio: 0.40 },
    'Croci ai Cavi alti': { base: 'bench', ratio: 0.3 },
    'French Press Bil. EZ': { base: 'bench', ratio: 0.35 },
    'Pushdown Corda': { base: 'bench', ratio: 0.35 },
    'Pushdown': { base: 'bench', ratio: 0.35 },
    'SS: French Press': { base: 'bench', ratio: 0.3 },
    
    'Trazioni': { base: 'bench', ratio: 0.65 },          // Lat pulldown ≈ 65% bench (era 0.9: troppo)
    'Trazioni (o Lat Machine)': { base: 'bench', ratio: 0.65 },
    'Rematore Bilanciere': { base: 'bench', ratio: 0.80 },
    'Rematore con Bilanciere': { base: 'bench', ratio: 0.80 },
    'SS: Rematore Bil.': { base: 'bench', ratio: 0.65 },
    'Pulley Basso': { base: 'bench', ratio: 0.70 },
    'Pulley Basso (presa stretta)': { base: 'bench', ratio: 0.70 },
    'Pull-over al cavo alto': { base: 'bench', ratio: 0.40 },
    'Curl Bilanciere': { base: 'bench', ratio: 0.38 },
    'Curl con Bilanciere': { base: 'bench', ratio: 0.38 },
    'Curl a Martello (Hammer)': { base: 'bench', ratio: 0.28 },
    'Hammer Curl': { base: 'bench', ratio: 0.28 },
    
    'Squat': { base: 'squat', ratio: 1.0 },
    'Squat con Bilanciere': { base: 'squat', ratio: 1.0 },
    'Leg Press': { base: 'squat', ratio: 1.5 },
    'Leg Press 45°': { base: 'squat', ratio: 1.5 },
    'Affondi Bulgari': { base: 'squat', ratio: 0.3 }, // Per lato
    'Leg Extension': { base: 'squat', ratio: 0.35 },
    'Calf Raise': { base: 'squat', ratio: 0.5 },
    'Calf Raise in piedi': { base: 'squat', ratio: 0.5 },
    
    'Military Press': { base: 'bench', ratio: 0.6 },
    'Military Press (in piedi)': { base: 'bench', ratio: 0.6 },
    'Shoulder Press': { base: 'bench', ratio: 0.6 },
    'Alzate Laterali': { base: 'bench', ratio: 0.15 },
    'Alzate Laterali Manubri': { base: 'bench', ratio: 0.15 },
    'Face Pull': { base: 'bench', ratio: 0.3 },
    'Face Pull (Cavi alti)': { base: 'bench', ratio: 0.3 },
    'Scrollate (Shrugs) Manubri': { base: 'deadlift', ratio: 0.6 },
    'Arnold Press': { base: 'bench', ratio: 0.4 },
    
    'Stacco Rumeno': { base: 'deadlift', ratio: 0.7 },
    'Stacco da Terra Rumeno': { base: 'deadlift', ratio: 0.7 },
    'Stacco Rumeno Manubri': { base: 'deadlift', ratio: 0.6 },
    'Hip Thrust': { base: 'deadlift', ratio: 1.0 },
    'Hip Thrust con Bilanciere': { base: 'deadlift', ratio: 1.0 },
    'Leg Curl': { base: 'squat', ratio: 0.3 },
    'Leg Curl Sdraiato': { base: 'squat', ratio: 0.3 },
    'Hyperextension': { base: 'deadlift', ratio: 0.2 }, // Spesso bodyweight o disco leggero
    'Hyperextension (con peso)': { base: 'deadlift', ratio: 0.2 },
    'Stacco da Terra': { base: 'deadlift', ratio: 1.0 },
    '1. Stacco da terra': { base: 'deadlift', ratio: 0.8 }, // Circuit version lighter
    
    'Goblet Squat': { base: 'squat', ratio: 0.4 },
    'Affondi camminati': { base: 'squat', ratio: 0.25 },
    'Rematore Manubrio': { base: 'bench', ratio: 0.35 },
    
    'Kettlebell Swing': { base: 'deadlift', ratio: 0.3 },
    'Thruster (Squat + Press)': { base: 'bench', ratio: 0.45 },
    'Step Up': { base: 'squat', ratio: 0.3 },
    'Chest Press': { base: 'bench', ratio: 0.85 },          // macchina ≈ leggermente più facile del bilanciere
    'Chest Press Machine': { base: 'bench', ratio: 0.85 },
    'Lat Machine': { base: 'bench', ratio: 0.65 },           // lat pulldown = simile a Trazioni
    'Lat Machine avanti': { base: 'bench', ratio: 0.65 },
    'Curl Bicipiti Cavi': { base: 'bench', ratio: 0.28 },
};

const PlanGenerationScreen: React.FC<PlanGenerationScreenProps> = ({ userProfile, onPlanGenerated }) => {
  const [status, setStatus] = useState('Analisi parametri fisici...');
  const [progress, setProgress] = useState(0);
  const [baseUsed, setBaseUsed] = useState('');

  useEffect(() => {
    const generateAlgorithmPlan = async () => {
      try {
        // STEP 1: Calcolo Massimale Diretto (Brzycki)
        setStatus(`Calcolo 1RM su ${userProfile.testExercise}...`);
        setProgress(10);
        await new Promise(r => setTimeout(r, 600)); 

        const weight = userProfile.testWeight || 0;
        const reps = userProfile.testReps || 0;
        
        // Formula Brzycki: Peso / (1.0278 - (0.0278 * Reps))
        let direct1RM = 0;
        if (reps > 0) {
            direct1RM = weight / (1.0278 - (0.0278 * reps));
        }

        setProgress(25);
        setStatus('Derivazione profilo di forza completo...');

        // STEP 2: Costruzione profilo di forza
        // Priorità: 1) massimali reali inseriti dall'utente (knownMaxes)
        //           2) stima tramite ratio IPF per i missing
        const isWoman = (userProfile.gender === 'Donna');

        // Ratio genere-specifici (IPF statistics, atleti natural intermedi)
        const R_SQ_FROM_B  = isWoman ? 1.45 : 1.35;  // Squat da Bench
        const R_DL_FROM_B  = isWoman ? 1.65 : 1.60;  // Deadlift da Bench
        const R_B_FROM_SQ  = 1 / R_SQ_FROM_B;
        const R_DL_FROM_SQ = R_DL_FROM_B / R_SQ_FROM_B;
        const R_B_FROM_DL  = 1 / R_DL_FROM_B;
        const R_SQ_FROM_DL = R_SQ_FROM_B / R_DL_FROM_B;

        // Massimali noti direttamente dall'utente (già calcolati in StrengthTestScreen)
        const known = userProfile.knownMaxes || {};
        const knownBench    = (known.bench    && known.bench    > 0) ? known.bench    : null;
        const knownSquat    = (known.squat    && known.squat    > 0) ? known.squat    : null;
        const knownDeadlift = (known.deadlift && known.deadlift > 0) ? known.deadlift : null;

        // Calcola il massimale dell'esercizio testato (Brzycki)
        const testExLower = userProfile.testExercise.toLowerCase();
        let currentBase = userProfile.testExercise;

        // Costruisci estimatedStats partendo dai valori noti
        // Se l'utente ha inserito più massimali, usa la media pesata per maggiore accuratezza
        let estimatedStats = { bench: 0, squat: 0, deadlift: 0 };

        // Raccoglie tutte le stime disponibili per ogni esercizio
        const benchEstimates:    number[] = [];
        const squatEstimates:    number[] = [];
        const deadliftEstimates: number[] = [];

        if (knownBench)    { benchEstimates.push(knownBench);    squatEstimates.push(knownBench * R_SQ_FROM_B);  deadliftEstimates.push(knownBench * R_DL_FROM_B); }
        if (knownSquat)    { squatEstimates.push(knownSquat);    benchEstimates.push(knownSquat * R_B_FROM_SQ);  deadliftEstimates.push(knownSquat * R_DL_FROM_SQ); }
        if (knownDeadlift) { deadliftEstimates.push(knownDeadlift); benchEstimates.push(knownDeadlift * R_B_FROM_DL); squatEstimates.push(knownDeadlift * R_SQ_FROM_DL); }

        // Se nessun massimale noto, usa il 1RM calcolato dal testExercise
        if (benchEstimates.length === 0 && squatEstimates.length === 0 && deadliftEstimates.length === 0) {
            if (testExLower.includes('panca') || testExLower.includes('bench')) {
                benchEstimates.push(direct1RM);
                squatEstimates.push(direct1RM * R_SQ_FROM_B);
                deadliftEstimates.push(direct1RM * R_DL_FROM_B);
            } else if (testExLower.includes('squat')) {
                squatEstimates.push(direct1RM);
                benchEstimates.push(direct1RM * R_B_FROM_SQ);
                deadliftEstimates.push(direct1RM * R_DL_FROM_SQ);
            } else {
                deadliftEstimates.push(direct1RM);
                benchEstimates.push(direct1RM * R_B_FROM_DL);
                squatEstimates.push(direct1RM * R_SQ_FROM_DL);
            }
        }

        // Media delle stime (se l'utente ha inserito più massimali, la media è più precisa)
        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        // I valori REALI inseriti dall'utente hanno precedenza assoluta sulla stima
        estimatedStats.bench    = knownBench    || avg(benchEstimates);
        estimatedStats.squat    = knownSquat    || avg(squatEstimates);
        estimatedStats.deadlift = knownDeadlift || avg(deadliftEstimates);

        setBaseUsed(currentBase);
        setStatus(`Bench: ${Math.round(estimatedStats.bench)}kg | Squat: ${Math.round(estimatedStats.squat)}kg | Stacco: ${Math.round(estimatedStats.deadlift)}kg`);

        setProgress(40);
        setStatus('Generazione libreria completa...');
        
        // STEP 3: Generazione di TUTTE le schede
        const allGeneratedWorkouts: WorkoutCard[] = [];
        const database = userProfile.gender === 'Donna' ? WORKOUT_TEMPLATES_WOMEN : WORKOUT_TEMPLATES_MEN;
        const categories = ['muscle', 'definition', 'weight_loss', 'endurance'];
        const userGoalKey = userProfile.goal || 'muscle';
        
        // Prioritizza la categoria scelta dall'utente
        const sortedCategories = [
            userGoalKey, 
            ...categories.filter(c => c !== userGoalKey)
        ];

        let processedCount = 0;
        const favs = userProfile.favoriteExercises || [];

        for (const catKey of sortedCategories) {
             // Determina l'intensità in base all'obiettivo
             let focusSuffix = "Ipertrofia";

             if (catKey === 'definition') {
                focusSuffix = "Definizione";
             } else if (catKey === 'endurance') {
                focusSuffix = "Resistenza";
             } else if (catKey === 'weight_loss') {
                focusSuffix = "Metabolico";
             } else {
                focusSuffix = "Massa";
             }

             const templates = database[catKey] || [];
             
             const customizedCatWorkouts = templates.map((tpl, idx) => {
                let affinity = 0;
                
                // Affinity Check
                tpl.exercises.forEach(ex => {
                    const exName = ex.name.toLowerCase();
                    favs.forEach(fav => {
                         if (exName.includes(fav.toLowerCase())) {
                             affinity += 10;
                         }
                    });
                });

                const updatedExercises = tpl.exercises.map(ex => {
                    const exNameLower = (ex.name ?? '').toLowerCase();
                    const repsStr = ex.reps ?? '';

                    // Cerca il ratio per l'esercizio corrente (match esatto poi parziale)
                    const exKey = Object.keys(EXERCISE_RATIOS).find(k => exNameLower === k.toLowerCase());
                    const fallbackKey = Object.keys(EXERCISE_RATIOS).find(k => exNameLower.includes(k.toLowerCase()));
                    const finalKey = exKey || fallbackKey;

                    let finalReps = repsStr;

                    // Salta esercizi a corpo libero, a tempo, o senza ratio
                    const skipWords = ['bodyweight', 'max', 'sec', 'min', '"', 'totali', 'totale', '/lato', 'm (rec', 'x 500', 'x 40m', 'reps'];
                    const repsLower = repsStr.toLowerCase();
                    const shouldSkip = !finalKey || skipWords.some(w => repsLower.includes(w));

                    if (!shouldSkip) {
                        const ratioData = EXERCISE_RATIOS[finalKey as string];
                        if (ratioData && estimatedStats[ratioData.base] > 0) {
                            const base1RM = estimatedStats[ratioData.base];
                            
                            // % 1RM basata sul rep range reale (formula Epley inversa)
                            const parseTargetReps = (rStr: string): number => {
                                const clean = rStr.replace(/\(.*?\)/g, '').trim();
                                const rangeMatch = clean.match(/(\d+)\s*[-–]\s*(\d+)/);
                                if (rangeMatch) return parseInt(rangeMatch[2]);
                                const singleMatch = clean.match(/\d+\s*[x×X]\s*(\d+)/i);
                                if (singleMatch) return parseInt(singleMatch[1]);
                                const fallback = clean.match(/(\d+)/);
                                return fallback ? parseInt(fallback[1]) : 10;
                            };

                            const repsToWorkingPct = (reps: number): number => {
                                if (reps <= 1)  return 0.95;
                                if (reps <= 3)  return 0.90;
                                if (reps <= 5)  return 0.85;
                                if (reps <= 6)  return 0.82;
                                if (reps <= 8)  return 0.77;
                                if (reps <= 10) return 0.72;
                                if (reps <= 12) return 0.67;
                                if (reps <= 15) return 0.63;
                                if (reps <= 20) return 0.56;
                                return 0.50;
                            };

                            const targetReps = parseTargetReps(repsStr);
                            const workingPct = repsToWorkingPct(targetReps);
                            
                            let calculatedWeight = base1RM * ratioData.ratio * workingPct;

                            // Arrotonda (1kg per pesi piccoli, 2.5kg per carichi normali)
                            if (calculatedWeight < 10 || ratioData.ratio <= 0.2) {
                                calculatedWeight = Math.round(calculatedWeight);
                            } else {
                                calculatedWeight = Math.round(calculatedWeight / 2.5) * 2.5;
                            }

                            if (calculatedWeight >= 2) {
                                // Carico nel campo reps — nome rimane SEMPRE pulito
                                finalReps = `${repsStr} @ ${calculatedWeight}kg`;
                            }
                        }
                    }

                    return {
                        ...ex,
                        name: ex.name,
                        reps: finalReps
                    };
                });

                return {
                    ...tpl,
                    id: `gen_${catKey}_${idx}_${Date.now()}`,
                    title: tpl.title,
                    focus: `${tpl.focus} • ${focusSuffix}`,
                    exercises: updatedExercises,
                    affinityScore: affinity
                };
             });
             
             allGeneratedWorkouts.push(...customizedCatWorkouts);
             processedCount++;
             setProgress(40 + (processedCount * 15)); 
        }

        // STEP 4: ORDINAMENTO FINALE
        allGeneratedWorkouts.sort((a, b) => (b.affinityScore || 0) - (a.affinityScore || 0));

        setProgress(100);
        setStatus('Libreria Pronta e Ottimizzata!');
        await new Promise(r => setTimeout(r, 500));
        
        // Arrotonda i massimali ai 2.5kg più vicini prima di salvarli
        const roundedMaxes = {
            bench: Math.round(estimatedStats.bench / 2.5) * 2.5,
            squat: Math.round(estimatedStats.squat / 2.5) * 2.5,
            deadlift: Math.round(estimatedStats.deadlift / 2.5) * 2.5,
        };
        onPlanGenerated(allGeneratedWorkouts, roundedMaxes);

      } catch (error) {
        console.error("Algo Error", error);
        setStatus('Errore nel calcolo.');
      }
    };

    generateAlgorithmPlan();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="z-10 flex flex-col items-center text-center w-full max-w-sm">
            <div className="w-24 h-24 relative flex items-center justify-center mb-8">
                {/* Spinner Rings */}
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div 
                    className="absolute inset-0 border-4 border-t-blue-500 border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin"
                    style={{ transition: 'all 0.5s' }}
                ></div>
                
                {progress < 100 ? (
                    <Calculator size={40} className="text-white animate-pulse" />
                ) : (
                    <CheckCircle2 size={40} className="text-emerald-500" />
                )}
            </div>

            <h2 className="text-2xl font-bold mb-2 transition-all">{progress < 100 ? 'Calcolo Carichi...' : 'Finito!'}</h2>
            <p className="text-slate-400 mb-8 h-6 text-sm">{status}</p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            {/* Math Formula Visualization (Decoration) */}
            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800 w-full backdrop-blur-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit size={16} className="text-blue-400" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Logica Applicata</p>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-500">
                    <p>Base Calcolo: <span className="text-white font-bold">{baseUsed || userProfile.testExercise}</span></p>
                    <p>1RM({userProfile.testExercise}) = {userProfile.testWeight}kg / (1.0278 - 0.0278×{userProfile.testReps})</p>
                    <p className="text-emerald-400 mt-1">
                        Ratio genere: {userProfile.gender === 'Donna' ? 'Donna (squat×1.45, dead×1.65)' : 'Uomo (squat×1.35, dead×1.60)'}
                    </p>
                    <p className="text-slate-500">Preferenze applicate: {userProfile.favoriteExercises?.length || 0}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlanGenerationScreen;
