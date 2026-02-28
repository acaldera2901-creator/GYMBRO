
import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Bell, Moon, ChevronRight, Edit3, User, X, Sun, Volume2, Smartphone, Medal, Lock, Flame, Dumbbell, Trophy, Target, Star, Swords, Calendar, Clock, CheckCircle2, Share2, Crown, ScanFace, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { UserProfile, UserStats, WorkoutCard, Badge, BadgeTier } from '../types';
import { SecureStorageManager } from '../lib/secureStorage';

interface ProfileScreenProps {
    onLogout: () => void;
    userProfile: UserProfile;
    userStats: UserStats;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onEditProfile: () => void;
    themeColor: string;
    workoutSchedule?: Record<string, WorkoutCard[]>;
    onDeleteWorkout?: (id: string, date: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
    onLogout, 
    userProfile, 
    userStats, 
    isDarkMode, 
    toggleTheme,
    onEditProfile,
    themeColor,
    workoutSchedule = {},
    onDeleteWorkout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  // const [showBadgesModal, setShowBadgesModal] = useState(false); // Disabled
  const [notifSettings, setNotifSettings] = useState({
      dailyReminder: true,
      sound: true,
      vibration: true
  });
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    setBiometricsEnabled(SecureStorageManager.isBiometricsEnabled());
  }, []);

  const handleToggleBiometrics = () => {
    const newState = !biometricsEnabled;
    setBiometricsEnabled(newState);
    SecureStorageManager.setBiometricsEnabled(newState);
  };

  const bgMain = isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]';
  const bgCard = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
  const textMain = isDarkMode ? 'text-white' : 'text-black';
  const textSub = isDarkMode ? 'text-zinc-500' : 'text-zinc-400';

  // --- CHART LOGIC ---
  const { chartData, weeklyTotalMinutes } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0); 
    
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToSubtract);

    const labels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    
    const data = [];
    let totalSecs = 0;

    for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        const dateKey = current.toLocaleDateString('en-CA');
        
        const workouts = (workoutSchedule[dateKey] as WorkoutCard[]) || [];
        const completedWorkouts = workouts.filter(w => w.isCompleted || w.completedImage || w.id.startsWith('done_'));

        const dailyDuration = completedWorkouts.reduce((acc, w) => acc + (w.completedDuration || 0), 0);
        totalSecs += dailyDuration;
        
        data.push({
            name: labels[i],
            hours: parseFloat((dailyDuration / 3600).toFixed(1)),
            minutes: Math.round(dailyDuration / 60),
            fullDate: dateKey
        });
    }

    return { 
        chartData: data, 
        weeklyTotalMinutes: Math.floor(totalSecs / 60)
    };
  }, [workoutSchedule]);

  // --- HISTORY LOGIC ---
  const recentHistory = useMemo(() => {
      const history: any[] = [];
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

      Object.entries(workoutSchedule).forEach(([dateKey, workouts]) => {
          const typedWorkouts = workouts as WorkoutCard[];
          const completed = typedWorkouts.filter(w => w.isCompleted || w.completedImage || w.id.startsWith('done_'));
          
          completed.forEach(w => {
              const d = new Date(dateKey);
              history.push({
                id: w.id,
                date: dateKey,
                dayName: dayNames[d.getDay()],
                title: w.title,
                duration: w.completedDuration || 0,
                exercises: w.exercises,
                category: w.category
            });
          });
      });

      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return history;
  }, [workoutSchedule]);

  if (showNotifications) {
      return (
          <div className={`min-h-screen ${bgMain} flex flex-col animate-slide-up-ios`}>
              <div className="px-6 pt-14 pb-4 flex justify-between items-center">
                  <h2 className={`text-2xl font-bold ${textMain}`}>Notifiche</h2>
                  <button onClick={() => setShowNotifications(false)} className={`p-2 rounded-full bg-zinc-800 text-white`}><X size={20} /></button>
              </div>
              <div className="px-4 mt-4">
                  <div className={`${bgCard} rounded-2xl overflow-hidden`}>
                      <SettingsToggle label="Promemoria Giornaliero" desc="Notifica alle 09:00" active={notifSettings.dailyReminder} onToggle={() => setNotifSettings(p => ({...p, dailyReminder: !p.dailyReminder}))} color={themeColor} isLast={false} isDarkMode={isDarkMode} />
                      <SettingsToggle label="Suoni App" desc="Effetti sonori" active={notifSettings.sound} onToggle={() => setNotifSettings(p => ({...p, sound: !p.sound}))} color={themeColor} isLast={false} isDarkMode={isDarkMode} />
                      <SettingsToggle label="Vibrazione" desc="Feedback aptico" active={notifSettings.vibration} onToggle={() => setNotifSettings(p => ({...p, vibration: !p.vibration}))} color={themeColor} isLast={true} isDarkMode={isDarkMode} />
                  </div>
              </div>
          </div>
      )
  }

  // --- MAIN VIEW ---
  return (
    <div className={`min-h-screen ${bgMain} pb-32 transition-colors duration-300`}>
      {/* Badges Modal Removed */}
      
      {/* Header */}
      <div className="pt-14 px-6 pb-6 flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${textMain}`}>Profilo</h1>
        <button onClick={onEditProfile} className={`text-${themeColor}-500 text-base font-medium hover:bg-${themeColor}-500/10 px-3 py-1 rounded-lg transition-colors`}>Modifica</button>
      </div>

      {/* Avatar Card */}
      <div className="px-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-3 group">
                <div className={`w-28 h-28 rounded-full p-1 border-2 ${isDarkMode ? `border-${themeColor}-500/30` : `border-${themeColor}-500`}`}>
                    <img src={userProfile.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"} className="w-full h-full rounded-full object-cover" />
                </div>
            </div>
            <h2 className={`text-2xl font-bold ${textMain}`}>{userProfile.name || 'Utente'}</h2>
          </div>
      </div>

      {/* Stats Widget Grid */}
      <div className="px-4 mb-6">
          <div className={`grid grid-cols-2 gap-3`}>
              <div className={`${bgCard} rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  <div className="bg-orange-500/10 p-2 rounded-full text-orange-500 mb-2"><Flame size={20} fill="currentColor" /></div>
                  <span className={`text-lg font-bold ${textMain}`}>{userStats.streak}</span>
                  <span className={`text-[10px] uppercase font-bold ${textSub}`}>Streak</span>
              </div>
              <div className={`${bgCard} rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  <div className={`bg-${themeColor}-500/10 p-2 rounded-full text-${themeColor}-500 mb-2`}><Dumbbell size={20} /></div>
                  <span className={`text-lg font-bold ${textMain}`}>{userStats.workoutsCompleted}</span>
                  <span className={`text-[10px] uppercase font-bold ${textSub}`}>Workout</span>
              </div>
          </div>
      </div>

      {/* Chart Widget */}
      <div className="px-4 mb-6">
          <div className={`${bgCard} rounded-3xl p-6 shadow-sm border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <div className="flex justify-between items-baseline mb-6">
                  <div>
                      <h3 className={`text-lg font-bold ${textMain}`}>Attività</h3>
                      <p className={`text-[10px] ${textSub} uppercase tracking-wider`}>Questa Settimana</p>
                  </div>
                  <span className={`text-xs font-bold text-${themeColor}-500 bg-${themeColor}-500/10 px-2 py-1 rounded-lg`}>
                      {Math.floor(weeklyTotalMinutes / 60)}h {weeklyTotalMinutes % 60}m Totali
                  </span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: isDarkMode ? '#52525b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{ fill: isDarkMode ? '#27272a' : '#f4f4f5', radius: 6 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className={`px-3 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-black shadow-lg'}`}>
                                            <p>{data.minutes} min</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 4, 4]} barSize={28}>
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.minutes > 0 
                                            ? (themeColor === 'rose' ? '#f43f5e' : '#10b981') 
                                            : (isDarkMode ? '#27272a' : '#e4e4e7')
                                    } 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Trophies Widget Removed */}

      {/* Weekly History List */}
      <div className="px-4 mb-6">
          <h3 className={`text-xs font-bold uppercase tracking-widest ${textSub} mb-3 pl-2`}>Storico Recente</h3>
          {recentHistory.length === 0 ? (
              <div className={`${bgCard} rounded-2xl p-8 text-center border-dashed border ${isDarkMode ? 'border-zinc-800' : 'border-zinc-300'}`}>
                  <Calendar size={32} className={`mx-auto mb-3 opacity-20 ${textSub}`} />
                  <p className={`text-sm ${textSub}`}>Nessun allenamento completato.</p>
              </div>
          ) : (
              <div className={`${bgCard} rounded-2xl overflow-hidden shadow-sm border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  {recentHistory.slice(0, 5).map((item, index) => (
                      <div key={item.id} className={`p-4 flex items-center gap-4 ${index !== recentHistory.length - 1 ? `border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}` : ''}`}>
                          <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                              <span className={`text-[10px] font-bold uppercase ${textSub}`}>{item.dayName.substring(0,3)}</span>
                              <span className={`text-sm font-black ${textMain}`}>{new Date(item.date).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                              <h4 className={`font-bold text-sm truncate ${textMain}`}>{item.title}</h4>
                              <p className={`text-[11px] ${textSub} flex items-center gap-2 mt-0.5`}>
                                  <span className={`uppercase font-bold text-${themeColor}-500`}>{item.category}</span>
                                  <span>•</span>
                                  <span>{Math.round(item.duration / 60)} min</span>
                              </p>
                          </div>
                          {onDeleteWorkout && (
                              <button 
                                onClick={() => onDeleteWorkout(item.id, item.date)}
                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Settings Group */}
      <div className="px-4">
          <h3 className={`text-xs font-bold uppercase tracking-widest ${textSub} mb-2 pl-4`}>Preferenze</h3>
          <div className={`${bgCard} rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <MenuItem icon={Settings} label="I miei Dati" onClick={onEditProfile} isDarkMode={isDarkMode} />
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ml-12`}></div>
              
              <SettingsToggle 
                label="Richiedi FaceID all'avvio" 
                desc="Maggiore sicurezza per il tuo account" 
                active={biometricsEnabled} 
                onToggle={handleToggleBiometrics} 
                color={themeColor} 
                isLast={false} 
                isDarkMode={isDarkMode} 
              />
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ml-12`}></div>

              <MenuItem icon={Bell} label="Notifiche" onClick={() => setShowNotifications(true)} isDarkMode={isDarkMode} />
              <div className={`h-px w-full ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ml-12`}></div>
              
              <div className={`flex items-center justify-between p-4 cursor-pointer active:bg-zinc-800/50 transition-colors ${bgCard}`} onClick={toggleTheme}>
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <span className={`${textMain} text-sm font-medium`}>Dark Mode</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? `bg-${themeColor}-500` : 'bg-zinc-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </div>
              </div>
          </div>

          <button onClick={onLogout} className="w-full mt-8 py-3 text-red-500 font-medium text-sm bg-transparent hover:bg-red-500/10 rounded-xl transition-colors mb-6">
              Esci dall'account
          </button>
      </div>
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, isDarkMode }: any) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer active:opacity-70 transition-opacity ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-500/20 text-zinc-400`}>
                <Icon size={18} />
            </div>
            <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium`}>{label}</span>
        </div>
        <ChevronRight size={16} className="text-zinc-500" />
    </div>
);

const SettingsToggle = ({ label, desc, active, onToggle, color, isLast, isDarkMode }: any) => (
    <div className={`flex items-center justify-between p-4 ${!isLast ? `border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}` : ''} ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
        <div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{label}</p>
            <p className="text-xs text-zinc-500">{desc}</p>
        </div>
        <button onClick={onToggle} className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${active ? `bg-${color}-500` : 'bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'left-[22px]' : 'left-0.5'}`}></div>
        </button>
    </div>
);

export default ProfileScreen;
