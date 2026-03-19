import { Activity, Dumbbell, Flame, Sparkles, Zap } from 'lucide-react';
import { CategoryType, WorkoutCard } from '../types';

// =============================================================================
// FONTE UNICA DI VERITÀ — Database schede GYMbro
// Questo file sostituisce:
//   - WORKOUTS_DATABASE_DEFAULT in screens/WorkoutDetailScreen.tsx
//   - TEMPLATES_SOURCE         in screens/PlanGenerationScreen.tsx
//   - CATEGORY_INFO            in screens/WorkoutDetailScreen.tsx
//   - EXERCISE_RATIOS          in screens/PlanGenerationScreen.tsx
// =============================================================================

// -----------------------------------------------------------------------------
// 1. LIBRERIA DISPLAY (20 schede complete con tempi di recupero)
//    Usata da: WorkoutDetailScreen
// -----------------------------------------------------------------------------
export const WORKOUT_LIBRARY: WorkoutCard[] = [
    // ── MASSA ──
    {
        id: 'mas_1',
        image: 'https://images.unsplash.com/photo-1534368786749-b63e05c90863?q=80&w=800&auto=format&fit=crop',
        category: 'Massa',
        title: 'Petto e Tricipiti',
        focus: 'Spinta e Tensione Meccanica',
        exercises: [
            { name: 'Panca Piana Bilanciere',    reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Spinte Manubri Inclinata',  reps: '3 x 8-10 (Rec. 90")' },
            { name: 'Dip alle Parallele',        reps: '3 x 8-10 (Rec. 90")' },
            { name: 'Croci ai Cavi alti',        reps: '3 x 12-15 (Rec. 60")' },
            { name: 'French Press Bil. EZ',      reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Pushdown Corda',            reps: '3 x 12-15 (Rec. 60")' },
        ],
        affinityScore: 100,
    },
    {
        id: 'mas_2',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop',
        category: 'Massa',
        title: 'Dorso e Bicipiti',
        focus: 'Trazione e Spessore',
        exercises: [
            { name: 'Trazioni (o Lat Machine)',       reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Rematore con Bilanciere',        reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Pulley Basso (presa stretta)',   reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Pull-over al cavo alto',         reps: '3 x 15 (Rec. 60")' },
            { name: 'Curl con Bilanciere',            reps: '4 x 8-10 (Rec. 90")' },
            { name: 'Curl a Martello (Hammer)',       reps: '3 x 12 (Rec. 60")' },
        ],
        affinityScore: 95,
    },
    {
        id: 'mas_3',
        image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=800&auto=format&fit=crop',
        category: 'Massa',
        title: 'Gambe (Focus Quad)',
        focus: 'Volume Arti Inferiori',
        exercises: [
            { name: 'Squat con Bilanciere',   reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Leg Press 45°',          reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Affondi Bulgari',        reps: '3 x 10/lato (Rec. 90")' },
            { name: 'Leg Extension',          reps: '4 x 15 (Rec. 60")' },
            { name: 'Calf Raise in piedi',    reps: '4 x 15 (Rec. 45")' },
        ],
        affinityScore: 90,
    },
    {
        id: 'mas_4',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
        category: 'Massa',
        title: 'Spalle & Richiamo Petto',
        focus: 'Deltoidi e Upper Chest',
        exercises: [
            { name: 'Military Press (in piedi)',       reps: '4 x 6-8 (Rec. 120")' },
            { name: 'Alzate Laterali Manubri',         reps: '4 x 12-15 (Rec. 60")' },
            { name: 'Face Pull (Cavi alti)',           reps: '3 x 15 (Rec. 60")' },
            { name: 'Panca Inclinata Manubri',         reps: '3 x 10-12 (Rec. 90")' },
            { name: 'Scrollate (Shrugs) Manubri',     reps: '3 x 12 (Rec. 60")' },
        ],
        affinityScore: 85,
    },
    {
        id: 'mas_5',
        image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=800&auto=format&fit=crop',
        category: 'Massa',
        title: 'Gambe (Focus Posteriore)',
        focus: 'Femorali e Glutei',
        exercises: [
            { name: 'Stacco da Terra Rumeno',          reps: '4 x 8 (Rec. 120")' },
            { name: 'Hip Thrust con Bilanciere',       reps: '4 x 10 (Rec. 90")' },
            { name: 'Leg Curl Sdraiato',               reps: '3 x 12 (Rec. 60")' },
            { name: 'Hyperextension (con peso)',       reps: '3 x 15 (Rec. 60")' },
            { name: 'Plank Addominale (zavorrato)',    reps: '3 x 60" (Rec. 60")' },
        ],
        affinityScore: 85,
    },

    // ── DEFINIZIONE ──
    {
        id: 'def_1',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
        category: 'Definizione',
        title: 'Upper Body Supersets',
        focus: 'Densità Spinta/Trazione',
        exercises: [
            { name: 'SS: Panca Piana + Rematore Bil.',      reps: '4 x 10+10 (Rec. 90")' },
            { name: 'SS: Military Press + Lat Machine',     reps: '3 x 12+12 (Rec. 75")' },
            { name: 'SS: Alzate Laterali + Face Pull',      reps: '3 x 15+15 (Rec. 60")' },
            { name: 'SS: French Press + Curl Bilanciere',   reps: '3 x 12+12 (Rec. 60")' },
        ],
        affinityScore: 95,
    },
    {
        id: 'def_2',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop',
        category: 'Definizione',
        title: 'Gambe Alta Intensità',
        focus: 'Gambe e Cardio',
        exercises: [
            { name: 'Goblet Squat',                         reps: '4 x 15 (Rec. 60")' },
            { name: 'SS: Affondi camminati + Leg Curl',     reps: '3 x 20+12 (Rec. 90")' },
            { name: 'SS: Leg Extension + Calf Press',       reps: '3 x 15+20 (Rec. 60")' },
            { name: 'Mountain Climbers',                    reps: '4 x 30" (Rec. 30")' },
        ],
        affinityScore: 90,
    },
    {
        id: 'def_3',
        image: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?q=80&w=800&auto=format&fit=crop',
        category: 'Definizione',
        title: 'Full Body Circuit A',
        focus: 'No Pausa (4 Giri)',
        exercises: [
            { name: '1. Stacco da terra',     reps: '10 reps' },
            { name: '2. Push Up',             reps: 'Max reps' },
            { name: '3. Box Jump (o Step Up)', reps: '15 reps' },
            { name: '4. Rematore Manubrio',   reps: '10 reps' },
            { name: '5. Plank',              reps: '45 sec' },
        ],
        affinityScore: 85,
    },
    {
        id: 'def_4',
        image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=800&auto=format&fit=crop',
        category: 'Definizione',
        title: 'Deltoidi e Braccia (Pumping)',
        focus: 'Volume Braccia e Spalle',
        exercises: [
            { name: 'Arnold Press',                            reps: '4 x 12 (Rec. 60")' },
            { name: 'Triset: Alzate Lat. + Front. + Post.',   reps: '3 x 10+10+10 (Rec. 90")' },
            { name: 'SS: Pushdown fune + Hammer Curl',        reps: '4 x 15+15 (Rec. 45")' },
            { name: 'Dip tra panche',                         reps: '3 x Max (Rec. 45")' },
        ],
        affinityScore: 85,
    },
    {
        id: 'def_5',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
        category: 'Definizione',
        title: 'Full Body Lattacido B',
        focus: 'Acido Lattico',
        exercises: [
            { name: 'Leg Press',          reps: '4 x 20 (Rec. 60")' },
            { name: 'Chest Press Machine', reps: '4 x 15 (Rec. 45")' },
            { name: 'Lat Machine Inversa', reps: '4 x 15 (Rec. 45")' },
            { name: 'Crunch a terra',      reps: '4 x 20 (Rec. 30")' },
            { name: 'Burpees',            reps: '3 x 10 (Rec. 60")' },
        ],
        affinityScore: 80,
    },

    // ── PERDITA PESO ──
    {
        id: 'fat_1',
        image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop',
        category: 'Perdita Peso',
        title: 'PHA Basic',
        focus: 'Peripheral Heart Action',
        exercises: [
            { name: 'Squat Libero',           reps: '4 x 15 (No Rec.)' },
            { name: 'Military Press Manubri', reps: '4 x 12 (Rec. 60")' },
            { name: 'Affondi Dietro',         reps: '3 x 12 (No Rec.)' },
            { name: 'Lat Machine avanti',     reps: '3 x 12 (Rec. 60")' },
            { name: 'Crunch Bicicletta',      reps: '3 x 30" (Rec. 30")' },
        ],
        affinityScore: 90,
    },
    {
        id: 'fat_2',
        image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=800&auto=format&fit=crop',
        category: 'Perdita Peso',
        title: 'Functional Fat Burn',
        focus: 'Metabolico Funzionale',
        exercises: [
            { name: 'Kettlebell Swing',         reps: '5 x 20 (Rec. 45")' },
            { name: 'Thruster (Squat + Press)', reps: '4 x 12 (Rec. 60")' },
            { name: 'Renegade Row',             reps: '4 x 8/lato (Rec. 45")' },
            { name: 'Jumping Jacks',            reps: '4 x 60" (Rec. 30")' },
        ],
        affinityScore: 90,
    },
    {
        id: 'fat_3',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
        category: 'Perdita Peso',
        title: 'PHA Advanced',
        focus: 'Alta Intensità PHA',
        exercises: [
            { name: 'Stacco Rumeno Manubri', reps: '4 x 12 (No Rec.)' },
            { name: 'Panca Piana Manubri',   reps: '4 x 12 (Rec. 60")' },
            { name: 'Step-Up su box',        reps: '3 x 15 (No Rec.)' },
            { name: 'Pulley Basso',          reps: '3 x 15 (Rec. 60")' },
            { name: 'Plank Jacks',           reps: '3 x 40" (Rec. 30")' },
        ],
        affinityScore: 85,
    },
    {
        id: 'fat_4',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=800&auto=format&fit=crop',
        category: 'Perdita Peso',
        title: 'Cardio Complex (Barbell)',
        focus: '4 Giri - Senza posare il bilanciere',
        exercises: [
            { name: '1. Stacco da terra', reps: '8 reps' },
            { name: '2. Rematore',        reps: '8 reps' },
            { name: '3. Front Squat',     reps: '8 reps' },
            { name: '4. Military Press',  reps: '8 reps (Rec. 90" fine giro)' },
        ],
        affinityScore: 85,
    },
    {
        id: 'fat_5',
        image: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?q=80&w=800&auto=format&fit=crop',
        category: 'Perdita Peso',
        title: 'Bodyweight HIIT',
        focus: '30s Lavoro / 15s Riposo (6 Giri)',
        exercises: [
            { name: 'Burpees',    reps: '30 sec' },
            { name: 'Squat Jump', reps: '30 sec' },
            { name: 'Push Up',    reps: '30 sec' },
            { name: 'Sit Ups',    reps: '30 sec' },
        ],
        affinityScore: 80,
    },

    // ── RESISTENZA ──
    {
        id: 'res_1',
        image: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?q=80&w=800&auto=format&fit=crop',
        category: 'Resistenza',
        title: 'Upper Body Endurance',
        focus: 'Alte Ripetizioni',
        exercises: [
            { name: 'Piegamenti (Push Up)',   reps: '3 x Max (Rec. 45")' },
            { name: 'Lat Machine',            reps: '3 x 20-25 (Rec. 45")' },
            { name: 'Chest Press',            reps: '3 x 20-25 (Rec. 45")' },
            { name: 'Alzate Laterali',        reps: '3 x 30 (Rec. 30")' },
            { name: 'Curl Bicipiti Cavi',     reps: '3 x 30 (Rec. 30")' },
        ],
        affinityScore: 90,
    },
    {
        id: 'res_2',
        image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop',
        category: 'Resistenza',
        title: 'Lower Body Endurance',
        focus: 'Resistenza Gambe',
        exercises: [
            { name: 'Squat a corpo libero', reps: '4 x 50 (Rec. 60")' },
            { name: 'Affondi camminati',    reps: '3 x 3 min (Rec. 60")' },
            { name: 'Leg Extension',        reps: '3 x 30 (Rec. 45")' },
            { name: 'Leg Curl',             reps: '3 x 30 (Rec. 45")' },
            { name: 'Calf alla pressa',     reps: '3 x 50 (Rec. 30")' },
        ],
        affinityScore: 85,
    },
    {
        id: 'res_3',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        category: 'Resistenza',
        title: 'Isometrica e Core',
        focus: 'Tenuta Statica',
        exercises: [
            { name: 'Wall Sit (Sedia al muro)',   reps: '4 x Max (Rec. 60")' },
            { name: 'Plank',                      reps: '4 x Max (Rec. 60")' },
            { name: 'Hollow Body Position',       reps: '4 x 45" (Rec. 45")' },
            { name: 'Superman Hold (Lombari)',    reps: '4 x 45" (Rec. 45")' },
        ],
        affinityScore: 85,
    },
    {
        id: 'res_4',
        image: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=800&auto=format&fit=crop',
        category: 'Resistenza',
        title: 'Circuito "100 Reps"',
        focus: 'Volume Totale',
        exercises: [
            { name: 'Leg Press',               reps: '100 Totali (Minori serie possibili)' },
            { name: 'Pulley Basso',            reps: '100 Totali (Minori serie possibili)' },
            { name: 'Shoulder Press Macchina', reps: '100 Totali (Minori serie possibili)' },
        ],
        affinityScore: 80,
    },
    {
        id: 'res_5',
        image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop',
        category: 'Resistenza',
        title: 'Cardio-Resistenza Mista',
        focus: 'Endurance Funzionale',
        exercises: [
            { name: 'Vogatore',                            reps: '3 x 500m (Rec. 60")' },
            { name: 'Kettlebell Swing',                    reps: '3 x 40 (Rec. 60")' },
            { name: 'Box Jump',                            reps: '3 x 20 (Rec. 60")' },
            { name: 'Farmer Walk (Camminata con pesi)',    reps: '3 x 40m (Rec. 60")' },
        ],
        affinityScore: 80,
    },
];

// -----------------------------------------------------------------------------
// 2. TEMPLATE PIANO (stesse schede senza tempi di recupero, per il calcolo carichi)
//    Usata da: PlanGenerationScreen
// -----------------------------------------------------------------------------
export const WORKOUT_TEMPLATES: Record<string, WorkoutCard[]> = {
    muscle: [
        { id: 't_m1', category: 'Massa', title: 'Petto e Tricipiti', focus: 'Spinta e Tensione', affinityScore: 0,
          exercises: [
              { name: 'Panca Piana Bilanciere',   reps: '4 x 6-8' },
              { name: 'Spinte Manubri Inclinata', reps: '3 x 8-10' },
              { name: 'Dip alle Parallele',       reps: '3 x 8-10' },
              { name: 'Croci ai Cavi alti',       reps: '3 x 12-15' },
              { name: 'French Press Bil. EZ',     reps: '4 x 8-10' },
              { name: 'Pushdown Corda',           reps: '3 x 12-15' },
          ] },
        { id: 't_m2', category: 'Massa', title: 'Dorso e Bicipiti', focus: 'Trazione e Spessore', affinityScore: 0,
          exercises: [
              { name: 'Trazioni (o Lat Machine)',     reps: '4 x 6-8' },
              { name: 'Rematore con Bilanciere',      reps: '4 x 8-10' },
              { name: 'Pulley Basso (presa stretta)', reps: '3 x 10-12' },
              { name: 'Pull-over al cavo alto',       reps: '3 x 15' },
              { name: 'Curl con Bilanciere',          reps: '4 x 8-10' },
              { name: 'Curl a Martello (Hammer)',     reps: '3 x 12' },
          ] },
        { id: 't_m3', category: 'Massa', title: 'Gambe (Focus Quad)', focus: 'Volume Arti Inferiori', affinityScore: 0,
          exercises: [
              { name: 'Squat con Bilanciere', reps: '4 x 6-8' },
              { name: 'Leg Press 45°',        reps: '3 x 10-12' },
              { name: 'Affondi Bulgari',      reps: '3 x 10/lato' },
              { name: 'Leg Extension',        reps: '4 x 15' },
              { name: 'Calf Raise in piedi',  reps: '4 x 15' },
          ] },
        { id: 't_m4', category: 'Massa', title: 'Spalle & Richiamo Petto', focus: 'Deltoidi e Upper Chest', affinityScore: 0,
          exercises: [
              { name: 'Military Press (in piedi)',   reps: '4 x 6-8' },
              { name: 'Alzate Laterali Manubri',     reps: '4 x 12-15' },
              { name: 'Face Pull (Cavi alti)',       reps: '3 x 15' },
              { name: 'Panca Inclinata Manubri',     reps: '3 x 10-12' },
              { name: 'Scrollate (Shrugs) Manubri', reps: '3 x 12' },
          ] },
        { id: 't_m5', category: 'Massa', title: 'Gambe (Focus Posteriore)', focus: 'Femorali e Glutei', affinityScore: 0,
          exercises: [
              { name: 'Stacco da Terra Rumeno',       reps: '4 x 8' },
              { name: 'Hip Thrust con Bilanciere',    reps: '4 x 10' },
              { name: 'Leg Curl Sdraiato',            reps: '3 x 12' },
              { name: 'Hyperextension (con peso)',    reps: '3 x 15' },
              { name: 'Plank Addominale (zavorrato)', reps: '3 x 60"' },
          ] },
    ],
    definition: [
        { id: 't_d1', category: 'Definizione', title: 'Upper Body Supersets', focus: 'Densità Spinta/Trazione', affinityScore: 0,
          exercises: [
              { name: 'SS: Panca Piana + Rematore Bil.',    reps: '4 x 10+10' },
              { name: 'SS: Military Press + Lat Machine',   reps: '3 x 12+12' },
              { name: 'SS: Alzate Laterali + Face Pull',    reps: '3 x 15+15' },
              { name: 'SS: French Press + Curl Bilanciere', reps: '3 x 12+12' },
          ] },
        { id: 't_d2', category: 'Definizione', title: 'Gambe Alta Intensità', focus: 'Gambe e Cardio', affinityScore: 0,
          exercises: [
              { name: 'Goblet Squat',                     reps: '4 x 15' },
              { name: 'SS: Affondi camminati + Leg Curl', reps: '3 x 20+12' },
              { name: 'SS: Leg Extension + Calf Press',   reps: '3 x 15+20' },
              { name: 'Mountain Climbers',                reps: '4 x 30 sec' },
          ] },
        { id: 't_d3', category: 'Definizione', title: 'Full Body Circuit A', focus: 'No Pausa (4 Giri)', affinityScore: 0,
          exercises: [
              { name: '1. Stacco da terra',      reps: '10 reps' },
              { name: '2. Push Up',              reps: 'Max reps' },
              { name: '3. Box Jump (o Step Up)', reps: '15 reps' },
              { name: '4. Rematore Manubrio',    reps: '10 reps' },
              { name: '5. Plank',               reps: '45 sec' },
          ] },
        { id: 't_d4', category: 'Definizione', title: 'Deltoidi e Braccia (Pumping)', focus: 'Volume Braccia e Spalle', affinityScore: 0,
          exercises: [
              { name: 'Arnold Press',                          reps: '4 x 12' },
              { name: 'Triset: Alzate Lat. + Front. + Post.', reps: '3 x 10+10+10' },
              { name: 'SS: Pushdown fune + Hammer Curl',      reps: '4 x 15+15' },
              { name: 'Dip tra panche',                       reps: '3 x Max' },
          ] },
        { id: 't_d5', category: 'Definizione', title: 'Full Body Lattacido B', focus: 'Acido Lattico', affinityScore: 0,
          exercises: [
              { name: 'Leg Press',          reps: '4 x 20' },
              { name: 'Chest Press Machine', reps: '4 x 15' },
              { name: 'Lat Machine Inversa', reps: '4 x 15' },
              { name: 'Crunch a terra',      reps: '4 x 20' },
              { name: 'Burpees',            reps: '3 x 10' },
          ] },
    ],
    weight_loss: [
        { id: 't_w1', category: 'Perdita Peso', title: 'PHA Basic', focus: 'Peripheral Heart Action', affinityScore: 0,
          exercises: [
              { name: 'Squat Libero',           reps: '4 x 15' },
              { name: 'Military Press Manubri', reps: '4 x 12' },
              { name: 'Affondi Dietro',         reps: '3 x 12' },
              { name: 'Lat Machine avanti',     reps: '3 x 12' },
              { name: 'Crunch Bicicletta',      reps: '3 x 30"' },
          ] },
        { id: 't_w2', category: 'Perdita Peso', title: 'Functional Fat Burn', focus: 'Metabolico Funzionale', affinityScore: 0,
          exercises: [
              { name: 'Kettlebell Swing',         reps: '5 x 20' },
              { name: 'Thruster (Squat + Press)', reps: '4 x 12' },
              { name: 'Renegade Row',             reps: '4 x 8/lato' },
              { name: 'Jumping Jacks',            reps: '4 x 60 sec' },
          ] },
        { id: 't_w3', category: 'Perdita Peso', title: 'PHA Advanced', focus: 'Alta Intensità PHA', affinityScore: 0,
          exercises: [
              { name: 'Stacco Rumeno Manubri', reps: '4 x 12' },
              { name: 'Panca Piana Manubri',   reps: '4 x 12' },
              { name: 'Step-Up su box',        reps: '3 x 15' },
              { name: 'Pulley Basso',          reps: '3 x 15' },
              { name: 'Plank Jacks',           reps: '3 x 40"' },
          ] },
        { id: 't_w4', category: 'Perdita Peso', title: 'Cardio Complex (Barbell)', focus: 'Complex (No Pause)', affinityScore: 0,
          exercises: [
              { name: '1. Stacco da terra', reps: '8 reps' },
              { name: '2. Rematore',        reps: '8 reps' },
              { name: '3. Front Squat',     reps: '8 reps' },
              { name: '4. Military Press',  reps: '8 reps' },
          ] },
        { id: 't_w5', category: 'Perdita Peso', title: 'Bodyweight HIIT', focus: '30s Work / 15s Rest', affinityScore: 0,
          exercises: [
              { name: 'Burpees',    reps: '30 sec' },
              { name: 'Squat Jump', reps: '30 sec' },
              { name: 'Push Up',    reps: '30 sec' },
              { name: 'Sit Ups',    reps: '30 sec' },
          ] },
    ],
    endurance: [
        { id: 't_e1', category: 'Resistenza', title: 'Upper Body Endurance', focus: 'Alte Ripetizioni', affinityScore: 0,
          exercises: [
              { name: 'Piegamenti (Push Up)', reps: '3 x Max' },
              { name: 'Lat Machine',          reps: '3 x 20-25' },
              { name: 'Chest Press',          reps: '3 x 20-25' },
              { name: 'Alzate Laterali',      reps: '3 x 30' },
              { name: 'Curl Bicipiti Cavi',   reps: '3 x 30' },
          ] },
        { id: 't_e2', category: 'Resistenza', title: 'Lower Body Endurance', focus: 'Resistenza Gambe', affinityScore: 0,
          exercises: [
              { name: 'Squat a corpo libero', reps: '4 x 50' },
              { name: 'Affondi camminati',    reps: '3 x 3 min' },
              { name: 'Leg Extension',        reps: '3 x 30' },
              { name: 'Leg Curl',             reps: '3 x 30' },
              { name: 'Calf alla pressa',     reps: '3 x 50' },
          ] },
        { id: 't_e3', category: 'Resistenza', title: 'Isometrica e Core', focus: 'Tenuta Statica', affinityScore: 0,
          exercises: [
              { name: 'Wall Sit (Sedia al muro)', reps: '4 x Max' },
              { name: 'Plank',                    reps: '4 x Max' },
              { name: 'Hollow Body Position',     reps: '4 x 45"' },
              { name: 'Superman Hold (Lombari)',  reps: '4 x 45"' },
          ] },
        { id: 't_e4', category: 'Resistenza', title: 'Circuito "100 Reps"', focus: 'Volume Totale', affinityScore: 0,
          exercises: [
              { name: 'Leg Press',               reps: '100 Totali' },
              { name: 'Pulley Basso',            reps: '100 Totali' },
              { name: 'Shoulder Press Macchina', reps: '100 Totali' },
          ] },
        { id: 't_e5', category: 'Resistenza', title: 'Cardio-Resistenza Mista', focus: 'Endurance Funzionale', affinityScore: 0,
          exercises: [
              { name: 'Vogatore',                         reps: '3 x 500m' },
              { name: 'Kettlebell Swing',                 reps: '3 x 40' },
              { name: 'Box Jump',                         reps: '3 x 20' },
              { name: 'Farmer Walk (Camminata con pesi)', reps: '3 x 40m' },
          ] },
    ],
};

// -----------------------------------------------------------------------------
// 3. CATEGORY INFO (metadati visuali per categoria)
//    Usata da: WorkoutDetailScreen
// -----------------------------------------------------------------------------
export const CATEGORY_INFO: Record<
    CategoryType,
    { color: string; icon: React.ElementType; desc: string; sub: string; imageMen: string; imageWomen: string; restSeconds: number }
> = {
    Massa: {
        color: 'emerald',
        icon: Dumbbell,
        desc: '3 giri • Recupero 90"',
        sub: 'Muscle Gain',
        imageMen:   'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop',
        imageWomen: 'https://images.unsplash.com/photo-1522898467493-49726bf28798?q=80&w=2070&auto=format&fit=crop',
        restSeconds: 90,
    },
    Definizione: {
        color: 'violet',
        icon: Zap,
        desc: '4 giri • Recupero 45"',
        sub: 'Shredded & Toned',
        imageMen:   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
        imageWomen: 'https://images.unsplash.com/photo-1609643002902-1063f5de5b21?q=80&w=2070&auto=format&fit=crop',
        restSeconds: 45,
    },
    'Perdita Peso': {
        color: 'orange',
        icon: Flame,
        desc: 'AMRAP • Rec. Attivo',
        sub: 'Fat Burn',
        imageMen:   'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        imageWomen: 'https://images.unsplash.com/photo-1574680096141-9877b4544b7d?q=80&w=2070&auto=format&fit=crop',
        restSeconds: 30,
    },
    Resistenza: {
        color: 'blue',
        icon: Activity,
        desc: 'Recupero 60"',
        sub: 'Endurance',
        imageMen:   'https://images.unsplash.com/photo-1517963879466-e825c6329090?q=80&w=2070&auto=format&fit=crop',
        imageWomen: 'https://images.unsplash.com/photo-1538805060504-630c9368c375?q=80&w=2070&auto=format&fit=crop',
        restSeconds: 60,
    },
    Custom: {
        color: 'purple',
        icon: Sparkles,
        desc: 'Le Tue Schede',
        sub: 'Personalizzato',
        imageMen:   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
        imageWomen: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop',
        restSeconds: 60,
    },
};

// -----------------------------------------------------------------------------
// 4. EXERCISE RATIOS (percentuali 1RM per calcolo carichi)
//    Usata da: PlanGenerationScreen
// -----------------------------------------------------------------------------
export const EXERCISE_RATIOS: Record<string, { base: 'bench' | 'squat' | 'deadlift'; ratio: number }> = {
    'Panca Piana':                    { base: 'bench',    ratio: 1.00 },
    'Panca Piana Bilanciere':         { base: 'bench',    ratio: 1.00 },
    'SS: Panca Piana':                { base: 'bench',    ratio: 0.80 },
    'Spinte Manubri Inclinata':       { base: 'bench',    ratio: 0.70 },
    'Panca Inclinata Manubri':        { base: 'bench',    ratio: 0.70 },
    'Dip alle Parallele':             { base: 'bench',    ratio: 0.40 },
    'Dip':                            { base: 'bench',    ratio: 0.40 },
    'Croci ai Cavi alti':             { base: 'bench',    ratio: 0.30 },
    'French Press Bil. EZ':           { base: 'bench',    ratio: 0.35 },
    'Pushdown Corda':                 { base: 'bench',    ratio: 0.35 },
    'Pushdown':                       { base: 'bench',    ratio: 0.35 },
    'SS: French Press':               { base: 'bench',    ratio: 0.30 },

    'Trazioni':                       { base: 'bench',    ratio: 0.65 },
    'Trazioni (o Lat Machine)':       { base: 'bench',    ratio: 0.65 },
    'Rematore Bilanciere':            { base: 'bench',    ratio: 0.80 },
    'Rematore con Bilanciere':        { base: 'bench',    ratio: 0.80 },
    'SS: Rematore Bil.':              { base: 'bench',    ratio: 0.65 },
    'Pulley Basso':                   { base: 'bench',    ratio: 0.70 },
    'Pulley Basso (presa stretta)':   { base: 'bench',    ratio: 0.70 },
    'Pull-over al cavo alto':         { base: 'bench',    ratio: 0.40 },
    'Curl Bilanciere':                { base: 'bench',    ratio: 0.38 },
    'Curl con Bilanciere':            { base: 'bench',    ratio: 0.38 },
    'Curl a Martello (Hammer)':       { base: 'bench',    ratio: 0.28 },
    'Hammer Curl':                    { base: 'bench',    ratio: 0.28 },

    'Squat':                          { base: 'squat',    ratio: 1.00 },
    'Squat con Bilanciere':           { base: 'squat',    ratio: 1.00 },
    'Leg Press':                      { base: 'squat',    ratio: 1.50 },
    'Leg Press 45°':                  { base: 'squat',    ratio: 1.50 },
    'Affondi Bulgari':                { base: 'squat',    ratio: 0.30 },
    'Leg Extension':                  { base: 'squat',    ratio: 0.35 },
    'Calf Raise':                     { base: 'squat',    ratio: 0.50 },
    'Calf Raise in piedi':            { base: 'squat',    ratio: 0.50 },

    'Military Press':                 { base: 'bench',    ratio: 0.60 },
    'Military Press (in piedi)':      { base: 'bench',    ratio: 0.60 },
    'Shoulder Press':                 { base: 'bench',    ratio: 0.60 },
    'Alzate Laterali':                { base: 'bench',    ratio: 0.15 },
    'Alzate Laterali Manubri':        { base: 'bench',    ratio: 0.15 },
    'Face Pull':                      { base: 'bench',    ratio: 0.30 },
    'Face Pull (Cavi alti)':          { base: 'bench',    ratio: 0.30 },
    'Scrollate (Shrugs) Manubri':     { base: 'deadlift', ratio: 0.60 },
    'Arnold Press':                   { base: 'bench',    ratio: 0.40 },

    'Stacco Rumeno':                  { base: 'deadlift', ratio: 0.70 },
    'Stacco da Terra Rumeno':         { base: 'deadlift', ratio: 0.70 },
    'Stacco Rumeno Manubri':          { base: 'deadlift', ratio: 0.60 },
    'Hip Thrust':                     { base: 'deadlift', ratio: 1.00 },
    'Hip Thrust con Bilanciere':      { base: 'deadlift', ratio: 1.00 },
    'Leg Curl':                       { base: 'squat',    ratio: 0.30 },
    'Leg Curl Sdraiato':              { base: 'squat',    ratio: 0.30 },
    'Hyperextension':                 { base: 'deadlift', ratio: 0.20 },
    'Hyperextension (con peso)':      { base: 'deadlift', ratio: 0.20 },
    'Stacco da Terra':                { base: 'deadlift', ratio: 1.00 },
    '1. Stacco da terra':             { base: 'deadlift', ratio: 0.80 },

    'Goblet Squat':                   { base: 'squat',    ratio: 0.40 },
    'Affondi camminati':              { base: 'squat',    ratio: 0.25 },
    'Rematore Manubrio':              { base: 'bench',    ratio: 0.35 },

    'Kettlebell Swing':               { base: 'deadlift', ratio: 0.30 },
    'Thruster (Squat + Press)':       { base: 'bench',    ratio: 0.45 },
    'Step Up':                        { base: 'squat',    ratio: 0.30 },
    'Chest Press':                    { base: 'bench',    ratio: 0.85 },
    'Chest Press Machine':            { base: 'bench',    ratio: 0.85 },
    'Lat Machine':                    { base: 'bench',    ratio: 0.65 },
    'Lat Machine avanti':             { base: 'bench',    ratio: 0.65 },
    'Curl Bicipiti Cavi':             { base: 'bench',    ratio: 0.28 },
};
