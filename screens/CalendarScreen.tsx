import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Dumbbell, CheckCircle2, Play, Trash2, Camera } from 'lucide-react';
import { WorkoutCard, CategoryType } from '../types';

interface CalendarScreenProps {
  schedule: Record<string, WorkoutCard[]>;
  availableWorkouts: WorkoutCard[];
  onScheduleWorkout: (date: string, workout: WorkoutCard) => void;
  onRemoveWorkout: (date: string, workoutId: string) => void;
  onStartWorkout: (workoutId: string) => void;
  onNavigateHome: () => void;
  isDarkMode: boolean;
  themeColor?: string;
}

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D', bg4: '#1E1E27',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B', amber: '#FFB347', sky: '#38BDF8', violet: '#A78BFA',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const DAYS_SHORT = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

const CalendarScreen: React.FC<CalendarScreenProps> = ({
  schedule, availableWorkouts, onScheduleWorkout, onRemoveWorkout,
  onStartWorkout, onNavigateHome, isDarkMode, themeColor = 'emerald',
}) => {
  const accent = themeColor === 'rose' ? T.coral : T.lime;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isAddModal, setIsAddModal] = useState(false);
  const [catFilter, setCatFilter] = useState<CategoryType | 'All'>('All');

  useEffect(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(new Date().setDate(diff)));
  }, []);

  const getKey = (d: Date) => d.toISOString().split('T')[0];

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  const selectedKey = getKey(selectedDate);
  const todayKey = getKey(new Date());
  const scheduledForDay = schedule[selectedKey] || [];
  const isToday = selectedKey === todayKey;

  const completedCount = scheduledForDay.filter(w => w.isCompleted || w.id.startsWith('done_')).length;
  const totalMins = scheduledForDay.filter(w => w.isCompleted).reduce((a, w) => a + Math.floor((w.completedDuration || 0) / 60), 0);

  const prevWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); };
  const nextWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); };

  const filtered = catFilter === 'All' ? availableWorkouts : availableWorkouts.filter(w => w.category === catFilter);

  const card: React.CSSProperties = { background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22 };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, paddingBottom: 112 }}>

      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(7,7,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}`, padding: '52px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 36, color: T.text, lineHeight: 1 }}>
              {MONTHS[currentWeekStart.getMonth()]}
              <span style={{ fontSize: 18, color: T.muted, marginLeft: 8 }}>{currentWeekStart.getFullYear()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={prevWeek} style={{ width: 36, height: 36, borderRadius: 12, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextWeek} style={{ width: 36, height: 36, borderRadius: 12, background: T.bg2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {weekDays.map((date, idx) => {
            const dKey = getKey(date);
            const isSelected = dKey === selectedKey;
            const isCurr = dKey === todayKey;
            const dayWorkouts = schedule[dKey] || [];
            const hasDone = dayWorkouts.some(w => w.isCompleted || w.id.startsWith('done_'));
            const hasSched = dayWorkouts.length > 0;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(new Date(date))}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '13%', aspectRatio: '4/6', borderRadius: 18, cursor: 'pointer', border: 'none',
                  background: isSelected ? accent : isCurr ? T.bg3 : 'transparent',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 0 20px ${accent}35` : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isSelected ? '#000' : T.muted, marginBottom: 2 }}>{DAYS_SHORT[idx]}</span>
                <span style={{ fontFamily: T.display, fontSize: 20, color: isSelected ? '#000' : T.text, lineHeight: 1 }}>{date.getDate()}</span>
                <div style={{ marginTop: 4, height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasDone
                    ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#000' : accent }} />
                    : hasSched
                    ? <div style={{ width: 5, height: 5, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#000' : T.muted}` }} />
                    : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Day summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 28, color: T.text, lineHeight: 1 }}>
              {isToday ? 'OGGI' : `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()].toUpperCase()}`}
            </div>
            {completedCount > 0 && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{completedCount} completato/i · {totalMins} min</div>}
          </div>
          <button
            onClick={() => setIsAddModal(true)}
            style={{ width: 40, height: 40, borderRadius: 14, background: accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 16px ${accent}35` }}
          >
            <Plus size={20} style={{ color: '#000' }} strokeWidth={3} />
          </button>
        </div>

        {/* Workout list */}
        {scheduledForDay.length === 0 ? (
          <div style={{ ...card, padding: '40px 20px', textAlign: 'center', border: `1px dashed ${T.border2}` }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 14, color: T.muted, marginBottom: 12 }}>Nessun allenamento programmato.</div>
            <button onClick={() => setIsAddModal(true)} style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent, borderRadius: 12, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.body }}>
              + Aggiungi Workout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scheduledForDay.map((workout, idx) => {
              const isCompleted = workout.isCompleted || !!workout.completedImage || workout.id.startsWith('done_');
              return (
                <div key={`${workout.id}-${idx}`} style={{ ...card, overflow: 'hidden', border: `1px solid ${isCompleted ? `${accent}30` : T.border}` }}>
                  {workout.completedImage ? (
                    <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img src={workout.completedImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,7,10,0.9) 0%, transparent 50%)' }} />
                      <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: accent, borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#000', marginBottom: 4 }}>
                            <Camera size={9} /> Memory
                          </div>
                          <div style={{ fontFamily: T.display, fontSize: 20, color: T.text }}>{workout.title}</div>
                        </div>
                        <button onClick={() => onRemoveWorkout(selectedKey, workout.id)} style={{ padding: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 10, cursor: 'pointer', color: T.muted }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                      {isCompleted && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: '22px 0 0 22px' }} />}
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: isCompleted ? `${accent}18` : T.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isCompleted
                          ? <CheckCircle2 size={22} style={{ color: accent }} />
                          : <Dumbbell size={22} style={{ color: T.muted }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isCompleted ? T.muted : T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {workout.title}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{workout.category}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!isCompleted && (
                          <button onClick={() => onStartWorkout(workout.id)} style={{ width: 34, height: 34, borderRadius: 11, background: accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${accent}35` }}>
                            <Play size={14} fill="#000" style={{ color: '#000', marginLeft: 2 }} />
                          </button>
                        )}
                        <button onClick={() => onRemoveWorkout(selectedKey, workout.id)} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,93,59,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} style={{ color: T.coral }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────────────────── */}
      {isAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={() => setIsAddModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 430, height: '72vh', background: T.bg2, borderRadius: '28px 28px 0 0', border: `1px solid ${T.border2}`, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)' }}>
            <style>{`@keyframes slideUp { from{transform:translateY(100%)} to{transform:none} }`}</style>

            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 100, background: T.border2 }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Aggiungi Workout</div>
                <div style={{ fontSize: 11, color: T.muted }}>{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</div>
              </div>
              <button onClick={() => setIsAddModal(false)} style={{ width: 32, height: 32, borderRadius: 10, background: T.bg3, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                <X size={16} />
              </button>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto' }}>
              {(['All', 'Massa', 'Definizione', 'Perdita Peso', 'Resistenza', 'Custom'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat as any)}
                  style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: T.body, border: `1px solid ${catFilter === cat ? accent : T.border}`, background: catFilter === cat ? `${accent}15` : T.bg3, color: catFilter === cat ? accent : T.muted, transition: 'all 0.2s' }}
                >
                  {cat === 'All' ? 'Tutti' : cat}
                </button>
              ))}
            </div>

            {/* Workout list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(workout => (
                <button
                  key={workout.id}
                  onClick={() => { onScheduleWorkout(selectedKey, workout); setIsAddModal(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 18, border: `1px solid ${T.border}`, background: T.bg3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: T.body, transition: 'border-color 0.2s' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: T.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: T.display, fontSize: 18, color: accent }}>{workout.title.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workout.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{workout.category} · {workout.exercises.length} esercizi</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent, opacity: 0 }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;
