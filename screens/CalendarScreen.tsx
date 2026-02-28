
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Dumbbell, Trash2, X, CheckCircle2, Camera, Clock, Zap, Play, Trophy, Flame } from 'lucide-react';
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

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const CalendarScreen: React.FC<CalendarScreenProps> = ({ 
  schedule, 
  availableWorkouts, 
  onScheduleWorkout, 
  onRemoveWorkout,
  onStartWorkout,
  onNavigateHome,
  isDarkMode,
  themeColor = 'emerald'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | 'All'>('All');

  useEffect(() => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      setCurrentWeekStart(monday);
      setSelectedDate(new Date()); 
  }, []);

  const theme = {
      bg: isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]',
      text: isDarkMode ? 'text-white' : 'text-slate-900',
      textSub: isDarkMode ? 'text-zinc-400' : 'text-slate-500',
      card: isDarkMode ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-slate-200 shadow-sm',
      accent: `text-${themeColor}-500`,
      accentBg: `bg-${themeColor}-500`,
      accentBorder: `border-${themeColor}-500`,
  };

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  const handlePrevWeek = () => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newStart);
  };

  const handleDayClick = (date: Date) => {
      setSelectedDate(date);
  };

  const handleAddWorkout = (workout: WorkoutCard) => {
      onScheduleWorkout(getDateKey(selectedDate), workout);
      setIsAddModalOpen(false);
  };

  const selectedKey = getDateKey(selectedDate);
  const scheduledForSelectedDate = schedule[selectedKey] || [];
  const isToday = selectedKey === getDateKey(new Date());

  const weekDays = useMemo(() => {
      const days = [];
      for (let i = 0; i < 7; i++) {
          const d = new Date(currentWeekStart);
          d.setDate(currentWeekStart.getDate() + i);
          days.push(d);
      }
      return days;
  }, [currentWeekStart]);

  const dailySummary = useMemo(() => {
      const completed = scheduledForSelectedDate.filter(w => w.isCompleted || w.completedImage || w.id.startsWith('done_'));
      const totalMins = completed.reduce((acc, w) => acc + Math.floor((w.completedDuration || 0) / 60), 0);
      return { count: completed.length, mins: totalMins };
  }, [scheduledForSelectedDate]);

  const filteredAvailableWorkouts = selectedCategoryFilter === 'All' 
    ? availableWorkouts 
    : availableWorkouts.filter(w => w.category === selectedCategoryFilter);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col pb-24 transition-colors duration-300 relative`}>
      
      {/* Header Month/Year */}
      <div className="pt-safe px-6 pb-2 flex items-center justify-between sticky top-0 z-20 bg-opacity-90 backdrop-blur-md transition-colors" style={{backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(242,242,247,0.8)'}}>
         <div>
            <h1 className="text-2xl font-black capitalize">{MONTHS[currentWeekStart.getMonth()]} <span className="text-lg font-medium opacity-50">{currentWeekStart.getFullYear()}</span></h1>
         </div>
         <div className="flex gap-2">
            <button onClick={handlePrevWeek} className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDarkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-200'}`}><ChevronLeft size={18}/></button>
            <button onClick={handleNextWeek} className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDarkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-200'}`}><ChevronRight size={18}/></button>
         </div>
      </div>

      {/* WEEK STRIP */}
      <div className="px-4 py-4 mb-2">
          <div className="flex justify-between items-center bg-transparent">
              {weekDays.map((date, idx) => {
                  const dKey = getDateKey(date);
                  const isSelected = dKey === selectedKey;
                  const isCurrentDay = dKey === getDateKey(new Date());
                  
                  const dayWorkouts = schedule[dKey] || [];
                  const hasCompleted = dayWorkouts.some(w => w.isCompleted || w.completedImage || w.id.startsWith('done_'));
                  const hasScheduled = dayWorkouts.length > 0;

                  return (
                      <button 
                        key={idx} 
                        onClick={() => handleDayClick(date)}
                        className={`relative flex flex-col items-center justify-center w-[13%] aspect-[4/6] rounded-2xl transition-all duration-300 ${
                            isSelected 
                            ? `${theme.accentBg} text-slate-950 shadow-lg shadow-${themeColor}-500/25 scale-105 z-10` 
                            : (isCurrentDay ? (isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-slate-200') : 'bg-transparent')
                        }`}
                      >
                          <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-slate-900/60' : theme.textSub}`}>{DAYS_SHORT[idx]}</span>
                          <span className={`text-lg font-black ${isSelected ? 'text-slate-950' : theme.text}`}>{date.getDate()}</span>
                          
                          <div className="mt-2 h-2 flex items-center justify-center">
                              {hasCompleted ? (
                                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : theme.accentBg}`}></div>
                              ) : hasScheduled ? (
                                  <div className={`w-1.5 h-1.5 rounded-full border ${isSelected ? 'border-slate-950' : 'border-zinc-500'}`}></div>
                              ) : null}
                          </div>
                      </button>
                  )
              })}
          </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-lg ${theme.text}`}>{isToday ? 'Oggi' : `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`}</h2>
              <button onClick={() => setIsAddModalOpen(true)} className={`w-8 h-8 rounded-full ${theme.accentBg} text-slate-950 flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-${themeColor}-500/20`}><Plus size={18} strokeWidth={3} /></button>
          </div>

          {/* SMART SUMMARY TILE */}
          <div className={`mb-6 p-5 rounded-3xl relative overflow-hidden flex items-center justify-between border ${theme.accentBorder} bg-${themeColor}-500/10 transition-all duration-500 animate-in zoom-in-95`}>
              <div className="relative z-10">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.accent} mb-1`}>Riepilogo Giorno</p>
                  <div className="flex items-baseline gap-1">
                     <span className={`text-4xl font-black ${theme.text}`}>{dailySummary.count}</span>
                     <span className="text-xs font-bold text-zinc-500">Allenamenti</span>
                  </div>
                  <p className={`text-xs ${theme.textSub} mt-1`}>{dailySummary.mins} Minuti Totali</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${theme.accentBg} flex items-center justify-center text-slate-950 shadow-lg shadow-${themeColor}-500/20 relative z-10`}>
                  <CheckCircle2 size={24} />
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${theme.accentBg} opacity-20 blur-2xl rounded-full pointer-events-none`}></div>
          </div>

          {/* Workout List */}
          <div className="space-y-3">
              {scheduledForSelectedDate.length === 0 ? (
                  <div className={`py-12 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
                      <CalendarIcon size={32} className="mb-2" />
                      <p className="text-sm font-medium">Nessun programma.</p>
                      <button onClick={() => setIsAddModalOpen(true)} className={`mt-2 text-xs font-bold ${theme.accent}`}>+ Aggiungi</button>
                  </div>
              ) : (
                  scheduledForSelectedDate.map((workout, idx) => {
                      const isCompleted = workout.isCompleted || !!workout.completedImage || workout.id.startsWith('done_');
                      const hasImage = !!workout.completedImage;

                      return (
                          <div key={`${workout.id}-${idx}`} className="group relative transition-transform active:scale-[0.99]">
                               {hasImage ? (
                                  <div className={`aspect-video w-full rounded-2xl overflow-hidden relative shadow-lg border ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                                      <img src={workout.completedImage!} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                          <div>
                                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${theme.accentBg} text-slate-950 mb-1`}>
                                                  <Camera size={10} /> Memory
                                              </div>
                                              <p className="text-white font-bold text-sm leading-tight">{workout.title}</p>
                                          </div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onRemoveWorkout(selectedKey, workout.id); }} 
                                            className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-red-400 hover:bg-black/60 transition-colors"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                               ) : (
                                  <div className={`${theme.card} p-4 rounded-2xl border flex items-center gap-4 relative overflow-hidden`}>
                                       {isCompleted && <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accentBg}`}></div>}
                                       
                                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isCompleted ? `${theme.accentBg} border-transparent text-slate-950` : (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                                           {isCompleted ? <CheckCircle2 size={20} /> : <Dumbbell size={20} />}
                                       </div>
                                       
                                       <div className="flex-1 min-w-0">
                                           <h3 className={`font-bold text-sm truncate ${isCompleted ? (isDarkMode ? 'text-zinc-400 line-through' : 'text-slate-400 line-through') : theme.text}`}>{workout.title}</h3>
                                           <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                               <span>{workout.category}</span>
                                           </p>
                                       </div>

                                       <div className="flex items-center gap-2">
                                          {!isCompleted && (
                                              <button onClick={() => onStartWorkout(workout.id)} className={`w-8 h-8 rounded-full ${theme.accentBg} text-slate-950 flex items-center justify-center shadow-lg shadow-${themeColor}-500/20`}><Play size={14} fill="currentColor" /></button>
                                          )}
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onRemoveWorkout(selectedKey, workout.id); }} 
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20`}
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                               )}
                          </div>
                      )
                  })
              )}
          </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAddModalOpen(false)}></div>
              <div className={`relative w-full max-w-md h-[70vh] rounded-t-[2rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
                  <div className="w-full flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-zinc-500/20"></div></div>
                  <div className="px-6 pb-4 pt-2 flex justify-between items-center border-b border-white/5">
                      <div>
                          <h3 className={`font-bold text-lg ${theme.text}`}>Aggiungi Workout</h3>
                          <p className={`text-xs ${theme.textSub}`}>{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</p>
                      </div>
                      <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400"><X size={18}/></button>
                  </div>
                  
                  <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                      {(['All', 'Massa', 'Definizione', 'Perdita Peso', 'Resistenza'] as const).map(cat => (
                          <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${selectedCategoryFilter === cat ? `${theme.accentBg} text-slate-950 border-transparent` : (isDarkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-200 text-slate-500')}`}>
                              {cat === 'All' ? 'Tutti' : cat}
                          </button>
                      ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      {filteredAvailableWorkouts.map(workout => (
                          <button key={workout.id} onClick={() => handleAddWorkout(workout)} className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between group transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                              <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-slate-400'} group-hover:${theme.accent} group-hover:bg-${themeColor}-500/10`}>
                                      {workout.title.charAt(0)}
                                  </div>
                                  <div>
                                      <p className={`font-bold text-sm ${theme.text}`}>{workout.title}</p>
                                      <p className={`text-xs ${theme.textSub}`}>{workout.category} • {workout.exercises.length} Es.</p>
                                  </div>
                              </div>
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isDarkMode ? 'border-zinc-700' : 'border-slate-300'} group-hover:border-${themeColor}-500`}>
                                  <div className={`w-2.5 h-2.5 rounded-full ${theme.accentBg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
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
