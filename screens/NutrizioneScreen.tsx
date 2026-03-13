import React, { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { UserProfile, UserStats } from '../types';

interface NutrizioneScreenProps {
  userProfile: UserProfile;
  userStats:   UserStats;
  isDarkMode:  boolean;
  themeColor:  string;
  onBack: () => void;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8', violet: '#A78BFA',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const MEAL_PLANS: Record<string, { name: string; meals: { time: string; title: string; desc: string; kcal: number }[] }> = {
  muscle: {
    name: 'Ipertrofia',
    meals: [
      { time: '07:30', title: 'Colazione',        desc: 'Avena 80g + 4 albumi + 1 uovo intero + frutta', kcal: 480 },
      { time: '10:30', title: 'Spuntino Pre',      desc: 'Riso soffiato 40g + burro di arachidi 20g',      kcal: 250 },
      { time: '13:00', title: 'Pranzo',            desc: 'Pollo 200g + riso 100g + verdure',               kcal: 620 },
      { time: '16:00', title: 'Pre-Workout',       desc: 'Banana + whey protein 30g',                      kcal: 280 },
      { time: '19:30', title: 'Post-Workout Cena', desc: 'Salmone 180g + patate dolci 150g + insalata',    kcal: 580 },
      { time: '22:00', title: 'Spuntino Notte',    desc: 'Ricotta 150g + mandorle 15g',                    kcal: 240 },
    ],
  },
  definition: {
    name: 'Definizione',
    meals: [
      { time: '07:30', title: 'Colazione',   desc: 'Uova strapazzate 3 + spinaci + pane integrale', kcal: 380 },
      { time: '10:30', title: 'Spuntino',    desc: 'Yogurt greco 0% + frutti rossi',                kcal: 180 },
      { time: '13:00', title: 'Pranzo',      desc: 'Tonno 150g + quinoa 80g + insalatone',          kcal: 480 },
      { time: '16:00', title: 'Pre-Workout', desc: 'Mela + 1 cucchiaio burro di arachidi',          kcal: 200 },
      { time: '19:30', title: 'Cena',        desc: 'Tacchino 180g + verdure grigliate',             kcal: 420 },
    ],
  },
  weight_loss: {
    name: 'Perdita Peso',
    meals: [
      { time: '08:00', title: 'Colazione', desc: '2 uova + 2 albumi + verdure saltate',               kcal: 280 },
      { time: '11:00', title: 'Spuntino',  desc: 'Sedano + hummus 60g',                              kcal: 120 },
      { time: '13:00', title: 'Pranzo',    desc: 'Pollo 150g + ceci 80g + olive',                    kcal: 420 },
      { time: '16:00', title: 'Spuntino',  desc: 'Proteina in polvere + acqua + frutta secca 10g',   kcal: 180 },
      { time: '19:00', title: 'Cena',      desc: 'Merluzzo 200g + verdure al vapore',                kcal: 320 },
    ],
  },
  endurance: {
    name: 'Resistenza',
    meals: [
      { time: '07:00', title: 'Colazione',       desc: "Porridge d'avena 100g + banana + miele",   kcal: 520 },
      { time: '10:00', title: 'Spuntino',        desc: 'Crackers integrali + yogurt greco',         kcal: 260 },
      { time: '13:00', title: 'Pranzo',          desc: 'Pasta integrale 120g + legumi + verdure',   kcal: 680 },
      { time: '16:30', title: 'Pre-Allenamento', desc: 'Banana + datteri',                          kcal: 200 },
      { time: '19:30', title: 'Post & Cena',     desc: 'Riso 100g + uova 3 + verdure + frutta',     kcal: 560 },
    ],
  },
};

const WATER_TIPS = [
  'Inizia la giornata con 500ml appena sveglio',
  'Bevi 500ml nelle 2h pre-allenamento',
  'Durante la sessione: 200ml ogni 20 min',
  'Post-workout: reintegra 1.5× il peso perso',
];

type Tab = 'macros' | 'piano' | 'acqua';

const NutrizioneScreen: React.FC<NutrizioneScreenProps> = ({ userProfile, isDarkMode, themeColor, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('macros');
  const isRose = themeColor === 'rose';
  const accent = isRose ? '#FF5D3B' : T.lime;

  const weight = userProfile.weight || 75;
  const goal   = userProfile.goal   || 'muscle';

  const macros = useMemo(() => {
    const m: Record<string, any> = {
      muscle:      { kcal: 36, protein: 2.2, carbs: 4.5, fat: 1.0 },
      definition:  { kcal: 29, protein: 2.4, carbs: 2.5, fat: 0.9 },
      weight_loss: { kcal: 24, protein: 2.0, carbs: 2.0, fat: 0.7 },
      endurance:   { kcal: 33, protein: 1.6, carbs: 5.5, fat: 0.8 },
    };
    const v = m[goal] || m.muscle;
    return { kcal: Math.round(weight * v.kcal), protein: Math.round(weight * v.protein), carbs: Math.round(weight * v.carbs), fat: Math.round(weight * v.fat) };
  }, [weight, goal]);

  const plan = MEAL_PLANS[goal] || MEAL_PLANS.muscle;
  const totalMealKcal = plan.meals.reduce((a, m) => a + m.kcal, 0);
  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };
  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'macros', label: 'Macros', emoji: '📊' },
    { id: 'piano',  label: 'Piano',  emoji: '🍽️' },
    { id: 'acqua',  label: 'Acqua',  emoji: '💧' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, paddingBottom: 40 }}>

      {/* HEADER */}
      <div style={{ padding: '56px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 14, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <div style={{ fontFamily: T.display, fontSize: 36, color: T.text, lineHeight: 1 }}>
            NUTRIZIONE
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
            {plan.name} · {weight}kg
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 0, padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 4, width: '100%' }}>
          {tabs.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none',
                background: activeTab === id ? T.bg3 : 'transparent',
                color: activeTab === id ? T.text : T.muted,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.body,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* MACROS TAB */}
        {activeTab === 'macros' && (
          <>
            {/* Kcal hero */}
            <div style={{ ...card, padding: '22px 22px 18px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Fabbisogno Calorico</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: T.display, fontSize: 72, color: accent, lineHeight: 1 }}>{macros.kcal}</span>
                  <span style={{ fontSize: 15, color: T.muted, marginLeft: 8, fontWeight: 500 }}>kcal / giorno</span>
                </div>
                <div style={{ fontSize: 36 }}>🔥</div>
              </div>
              {/* Macro bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 6, borderRadius: 100, overflow: 'hidden', display: 'flex', gap: 2 }}>
                  <div style={{ flex: macros.protein * 4, background: T.lime, borderRadius: 100 }} />
                  <div style={{ flex: macros.carbs * 4, background: T.violet, borderRadius: 100 }} />
                  <div style={{ flex: macros.fat * 9, background: T.amber, borderRadius: 100 }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  {[
                    { label: 'P', pct: Math.round(macros.protein * 4 / macros.kcal * 100), color: T.lime },
                    { label: 'C', pct: Math.round(macros.carbs * 4 / macros.kcal * 100), color: T.violet },
                    { label: 'G', pct: Math.round(macros.fat * 9 / macros.kcal * 100), color: T.amber },
                  ].map(({ label, pct, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 11, color: T.muted }}>{label} {pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Macro cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Proteine', value: macros.protein, unit: 'g', icon: '🥩', color: T.lime,   desc: `${(macros.protein / weight).toFixed(1)}g/kg` },
                { label: 'Carboidrati', value: macros.carbs, unit: 'g', icon: '🌾', color: T.violet, desc: 'Fonte energetica' },
                { label: 'Grassi',    value: macros.fat,   unit: 'g', icon: '🫒', color: T.amber,  desc: 'Ormoni e salute' },
              ].map(({ label, value, unit, icon, color, desc }) => (
                <div key={label} style={{ ...card, padding: '16px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: T.display, fontSize: 30, color, lineHeight: 1 }}>{value}<span style={{ fontSize: 10, color: T.muted }}>{unit}</span></div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.muted, marginTop: 4 }}>{label}</div>
                  <div style={{ fontSize: 10, color: T.muted2, marginTop: 4 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div style={{ background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.6 }}>
                💡 <strong style={{ color: T.text }}>Consiglio:</strong> Distribuisci le proteine in 5-6 pasti. Il corpo ne assorbe circa 40g per pasto.
              </div>
            </div>
          </>
        )}

        {/* PIANO TAB */}
        {activeTab === 'piano' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Piano {plan.name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{totalMealKcal} kcal totali</div>
            </div>

            {plan.meals.map((meal, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: "'DM Mono', monospace" }}>{meal.time}</div>
                  {i < plan.meals.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 20, background: T.border, margin: '4px 0' }} />}
                </div>
                {/* Card */}
                <div style={{ ...card, flex: 1, padding: '14px 16px', marginBottom: i < plan.meals.length - 1 ? 4 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{meal.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{meal.kcal} kcal</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.4 }}>{meal.desc}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ACQUA TAB */}
        {activeTab === 'acqua' && (
          <>
            {/* Daily target */}
            <div style={{ ...card, padding: '22px 22px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6 }}>Obiettivo Giornaliero</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: T.display, fontSize: 72, color: T.sky, lineHeight: 1 }}>
                    {(weight * 0.033).toFixed(1)}
                  </span>
                  <span style={{ fontSize: 15, color: T.muted, marginLeft: 8 }}>litri / giorno</span>
                </div>
                <div style={{ fontSize: 36 }}>💧</div>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: T.muted }}>
                Basato sul tuo peso: {weight}kg × 33ml/kg
              </div>
            </div>

            {/* Tips */}
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>CONSIGLI DI IDRATAZIONE</div>
            {WATER_TIPS.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', ...card, padding: '14px 16px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>💧</div>
                <div style={{ fontSize: 13, color: T.muted2, lineHeight: 1.5 }}>{tip}</div>
              </div>
            ))}

            {/* Electrolytes reminder */}
            <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: T.muted2, lineHeight: 1.6 }}>
                ⚡ <strong style={{ color: T.text }}>Elettroliti:</strong> Dopo allenamenti intensi (60+ min), considera acqua con elettroliti o una banana per il potassio.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NutrizioneScreen;
