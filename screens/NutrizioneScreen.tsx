import React, { useState } from 'react';
import { ChevronLeft, Flame, Droplets, Beef, Wheat, Apple, Info, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { UserProfile, UserStats } from '../types';

interface NutrizioneScreenProps {
  userProfile: UserProfile;
  userStats: UserStats;
  isDarkMode: boolean;
  themeColor: string;
  onBack: () => void;
}

const MEAL_PLANS: Record<string, { name: string; meals: { time: string; title: string; desc: string; kcal: number }[] }> = {
  muscle: {
    name: 'Ipertrofia',
    meals: [
      { time: '07:30', title: 'Colazione',        desc: 'Avena 80g + 4 albumi + 1 uovo intero + frutta', kcal: 480 },
      { time: '10:30', title: 'Spuntino Pre',      desc: 'Riso soffiato 40g + burro di arachidi 20g',       kcal: 250 },
      { time: '13:00', title: 'Pranzo',            desc: 'Petto di pollo 200g + riso 100g + verdure',        kcal: 620 },
      { time: '16:00', title: 'Pre-Workout',       desc: 'Banana + whey protein 30g',                       kcal: 280 },
      { time: '19:30', title: 'Post-Workout Cena', desc: 'Salmone 180g + patate dolci 150g + insalata',      kcal: 580 },
      { time: '22:00', title: 'Spuntino Notte',    desc: 'Ricotta 150g + mandorle 15g',                     kcal: 240 },
    ]
  },
  definition: {
    name: 'Definizione',
    meals: [
      { time: '07:30', title: 'Colazione',    desc: 'Uova strapazzate 3 + spinaci + pane integrale 1 fetta', kcal: 380 },
      { time: '10:30', title: 'Spuntino',     desc: 'Yogurt greco 0% + frutti rossi',                       kcal: 180 },
      { time: '13:00', title: 'Pranzo',       desc: 'Tonno 150g + quinoa 80g + insalatone miste',            kcal: 480 },
      { time: '16:00', title: 'Pre-Workout',  desc: 'Mela + 1 cucchiaio burro di arachidi',                 kcal: 200 },
      { time: '19:30', title: 'Cena',         desc: 'Petto di tacchino 180g + verdure grigliate + EVOO',     kcal: 420 },
    ]
  },
  weight_loss: {
    name: 'Perdita Peso',
    meals: [
      { time: '08:00', title: 'Colazione',   desc: '2 uova + 2 albumi + verdure saltate',                   kcal: 280 },
      { time: '11:00', title: 'Spuntino',    desc: 'Sedano + hummus 60g',                                   kcal: 120 },
      { time: '13:00', title: 'Pranzo',      desc: 'Insalata di pollo 150g + ceci 80g + olive',             kcal: 420 },
      { time: '16:00', title: 'Spuntino',    desc: 'Proteina in polvere + acqua + frutta secca 10g',        kcal: 180 },
      { time: '19:00', title: 'Cena',        desc: 'Merluzzo 200g + verdure al vapore + 1 cucchiaio EVOO',  kcal: 320 },
    ]
  },
  endurance: {
    name: 'Resistenza',
    meals: [
      { time: '07:00', title: 'Colazione',       desc: 'Porridge d\'avena 100g + banana + miele',           kcal: 520 },
      { time: '10:00', title: 'Spuntino',        desc: 'Crackers integrali + yogurt greco',                  kcal: 260 },
      { time: '13:00', title: 'Pranzo',          desc: 'Pasta integrale 120g + legumi + verdure',            kcal: 680 },
      { time: '16:30', title: 'Pre-Allenamento', desc: 'Banana + gel energetico o datteri',                  kcal: 200 },
      { time: '19:30', title: 'Post & Cena',     desc: 'Riso 100g + uova 3 + verdure + frutta',              kcal: 560 },
    ]
  },
};

const WATER_TIPS = ['Inizia la giornata con 500ml appena sveglio', 'Bevi 500ml nelle 2h pre-allenamento', 'Durante la sessione: 200ml ogni 20 minuti', 'Post-workout: reintegra 1.5× il peso perso in sudore'];

const NutrizioneScreen: React.FC<NutrizioneScreenProps> = ({ userProfile, userStats, isDarkMode, themeColor, onBack }) => {
  const [activeTab, setActiveTab] = useState<'macros' | 'piano' | 'acqua'>('macros');
  const isRose = themeColor === 'rose';
  const accent = isRose ? '#f43f5e' : '#10b981';
  const accentBg = isRose ? 'bg-rose-500' : 'bg-emerald-500';
  const accentText = isRose ? 'text-rose-400' : 'text-emerald-400';

  const weight = userProfile.weight || 75;
  const goal = userProfile.goal || 'muscle';
  const theme = isDarkMode
    ? { bg: 'bg-black', card: 'bg-[#1c1c1e] border-white/8', text: 'text-white', sub: 'text-zinc-400' }
    : { bg: 'bg-gray-50', card: 'bg-white border-gray-100', text: 'text-gray-900', sub: 'text-gray-500' };

  // Calcola macros in base a obiettivo e peso
  const macros = (() => {
    const multipliers: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {
      muscle:      { kcal: 36, protein: 2.2, carbs: 4.5, fat: 1.0 },
      definition:  { kcal: 29, protein: 2.4, carbs: 2.5, fat: 0.9 },
      weight_loss: { kcal: 24, protein: 2.0, carbs: 2.0, fat: 0.7 },
      endurance:   { kcal: 33, protein: 1.6, carbs: 5.5, fat: 0.8 },
    };
    const m = multipliers[goal] || multipliers.muscle;
    const kcal    = Math.round(weight * m.kcal);
    const protein = Math.round(weight * m.protein);
    const carbs   = Math.round(weight * m.carbs);
    const fat     = Math.round(weight * m.fat);
    return { kcal, protein, carbs, fat };
  })();

  const waterLiters = (weight * 0.035 + (goal === 'endurance' ? 0.5 : 0.2)).toFixed(1);
  const mealPlan = MEAL_PLANS[goal] || MEAL_PLANS.muscle;
  const totalKcal = mealPlan.meals.reduce((a, m) => a + m.kcal, 0);

  const MacroCard = ({ label, value, unit, color, pct }: { label: string; value: number; unit: string; color: string; pct: number }) => (
    <div className={`rounded-2xl p-4 border ${theme.card}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.sub} mb-2`}>{label}</p>
      <p className="text-2xl font-black text-white">{value}<span className="text-sm font-medium text-zinc-500 ml-1">{unit}</span></p>
      <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={onBack} className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} border flex items-center justify-center`}>
          <ChevronLeft size={20} className={theme.text} />
        </button>
        <div>
          <h1 className={`text-xl font-black ${theme.text}`}>Nutrizione</h1>
          <p className={`text-xs ${theme.sub}`}>Personalizzata per {mealPlan.name}</p>
        </div>
      </div>

      {/* Calorie hero */}
      <div className="mx-5 mb-4 rounded-3xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}05)`, border: `1px solid ${accent}30` }}>
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Fabbisogno Giornaliero</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{macros.kcal}</span>
            <span className="text-zinc-400 font-medium">kcal / giorno</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Calcolato su {weight}kg • Obiettivo: {mealPlan.name}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: accent }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {(['macros', 'piano', 'acqua'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
              activeTab === tab ? `${accentBg} text-black` : `${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-gray-500'} border ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'}`
            }`}>
            {tab === 'macros' ? '⚡ Macros' : tab === 'piano' ? '🍽 Piano' : '💧 Acqua'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 space-y-3">
        {activeTab === 'macros' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <MacroCard label="Proteine" value={macros.protein} unit="g" color="#10b981" pct={70} />
              <MacroCard label="Carboidrati" value={macros.carbs} unit="g" color="#6366f1" pct={85} />
              <MacroCard label="Grassi" value={macros.fat} unit="g" color="#f59e0b" pct={55} />
            </div>

            {/* Distribuzione calorie */}
            <div className={`rounded-2xl p-4 border ${theme.card}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${theme.sub} mb-3`}>Distribuzione Calorica</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${Math.round((macros.protein * 4 / macros.kcal) * 100)}%` }} />
                <div className="h-full bg-indigo-500" style={{ width: `${Math.round((macros.carbs * 4 / macros.kcal) * 100)}%` }} />
                <div className="h-full bg-amber-500 rounded-r-full flex-1" />
              </div>
              <div className="flex justify-between mt-2">
                {[['Proteine', '#10b981', `${Math.round((macros.protein * 4 / macros.kcal) * 100)}%`],
                  ['Carbo', '#6366f1', `${Math.round((macros.carbs * 4 / macros.kcal) * 100)}%`],
                  ['Grassi', '#f59e0b', `${Math.round((macros.fat * 9 / macros.kcal) * 100)}%`]].map(([label, color, pct]) => (
                  <div key={label as string} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color as string }} />
                    <span className="text-[10px] text-zinc-500 font-medium">{label} {pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-4 border ${theme.card}`}>
              <div className="flex items-start gap-3">
                <Info size={16} className={`${accentText} mt-0.5 shrink-0`} />
                <div>
                  <p className={`text-xs font-bold ${theme.text} mb-1`}>Come usare questi numeri</p>
                  <p className={`text-xs ${theme.sub} leading-relaxed`}>
                    Distribuisci le proteine in 4–5 pasti da ~{Math.round(macros.protein / 5)}g ciascuno per massimizzare la sintesi proteica muscolare. I carboidrati concentrali attorno all'allenamento.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'piano' && (
          <>
            <div className={`rounded-2xl p-3 border ${theme.card}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.sub} mb-1`}>Totale stimato piano</p>
              <p className={`text-lg font-black ${theme.text}`}>{totalKcal} kcal <span className={`text-sm font-normal ${theme.sub}`}>vs target {macros.kcal} kcal</span></p>
            </div>
            {mealPlan.meals.map((meal, i) => (
              <div key={i} className={`rounded-2xl p-4 border ${theme.card} flex items-start gap-4`}>
                <div className="shrink-0 text-center">
                  <p className={`text-[10px] font-bold ${theme.sub} font-mono`}>{meal.time}</p>
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${theme.text}`}>{meal.title}</p>
                  <p className={`text-xs ${theme.sub} mt-0.5 leading-relaxed`}>{meal.desc}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-bold ${accentText}`}>{meal.kcal}</span>
                  <p className={`text-[9px] ${theme.sub}`}>kcal</p>
                </div>
              </div>
            ))}
            <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-[10px] ${theme.sub} text-center`}>💡 Piano indicativo. Adatta le porzioni alle tue preferenze.</p>
            </div>
          </>
        )}

        {activeTab === 'acqua' && (
          <>
            <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, #3b82f620, #1e40af10)`, border: '1px solid #3b82f630' }}>
              <Droplets size={36} className="text-blue-400 mx-auto mb-3" />
              <p className="text-6xl font-black text-white">{waterLiters}</p>
              <p className="text-blue-400 font-bold mt-1">litri al giorno</p>
              <p className="text-zinc-500 text-xs mt-2">Calcolato su {weight}kg di peso corporeo</p>
            </div>
            <div className={`rounded-2xl p-4 border ${theme.card}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${theme.sub} mb-3`}>Distribuzione ottimale</p>
              <div className="space-y-3">
                {WATER_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-blue-400 text-[10px] font-black">{i+1}</span>
                    </div>
                    <p className={`text-xs ${theme.sub} leading-relaxed flex-1`}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl p-4 border ${theme.card}`}>
              <p className={`text-xs font-bold ${theme.text} mb-2`}>🚨 Segnali di disidratazione</p>
              <div className="flex flex-wrap gap-2">
                {['Urine scure', 'Crampi', 'Stanchezza', 'Mal di testa', 'Calo performance'].map(s => (
                  <span key={s} className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">{s}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NutrizioneScreen;
