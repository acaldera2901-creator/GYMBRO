# GYMbro — Design System v2 · Guida Sostituzione

## Font (aggiungere in index.html)
```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

## Color Tokens (sostituiscono i colori Tailwind originali)
| Nuovo       | Valore    | Rimpiazza             |
|------------|-----------|----------------------|
| bg         | #07070A   | bg-black / bg-[#080808] |
| bg2        | #0F0F14   | bg-[#121212]         |
| bg3        | #16161D   | bg-[#1c1c1e]         |
| lime       | #C8FF00   | emerald-500          |
| coral      | #FF5D3B   | rose-500             |
| amber      | #FFB347   | orange-400           |
| sky        | #38BDF8   | sky-400              |
| violet     | #A78BFA   | violet-400           |

## File da sostituire (drop-in, stessa interfaccia props)
1. screens/LoginScreen.tsx
2. screens/HomeScreen.tsx
3. screens/ProfileConfigScreen.tsx
4. screens/GoalSelectionScreen.tsx
5. screens/StrengthTestScreen.tsx
6. screens/PlanGenerationScreen.tsx   ← nota: logica generazione piano IDENTICA originale
7. screens/PreferencesScreen.tsx
8. screens/NutrizioneScreen.tsx
9. screens/ProfileScreen.tsx
10. screens/CalendarScreen.tsx
11. screens/WorkoutDetailScreen.tsx   ← nota: importa WORKOUTS_DATABASE_DEFAULT dall'originale
12. screens/CustomWorkoutBuilder.tsx
13. components/BottomNav.tsx

## Note critiche
- WorkoutDetailScreen.tsx contiene un import fittizio `./WorkoutDetailScreen.data`
  → sostituirlo copiando il const WORKOUTS_DATABASE_DEFAULT dall'originale direttamente nel file
- PlanGenerationScreen.tsx contiene un commento che indica dove inserire la logica generazione piano
  → copiare il corpo di `onPlanGenerated` dall'originale (è identico, solo il loading screen cambia)
- App.tsx → NESSUNA MODIFICA NECESSARIA
- types.ts → NESSUNA MODIFICA NECESSARIA
- lib/* → NESSUNA MODIFICA NECESSARIA
