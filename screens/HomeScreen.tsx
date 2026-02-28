
import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, Bell, BarChart2, Users, Dumbbell, CheckCircle2, User, X, Star, TrendingUp, Calendar as CalendarIcon, Swords, Bot } from 'lucide-react';
import { ScreenName, UserProfile, UserStats, WorkoutCard, AppNotification } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
  userProfile: UserProfile;
  userStats: UserStats;
  availableWorkouts: WorkoutCard[];
  onStartWorkout: (workoutId: string) => void;
  isDarkMode: boolean;
  themeColor: string;
  notifications?: AppNotification[];
  onMarkNotificationsRead?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    onNavigate, 
    userProfile, 
    userStats, 
    availableWorkouts, 
    onStartWorkout, 
    isDarkMode, 
    themeColor, 
    notifications = [],
    onMarkNotificationsRead 
}) => {
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'GymBro';
  const unreadCount = notifications.filter(n => !n.read).length;

  const theme = {
      bg: isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]',
      text: isDarkMode ? 'text-white' : 'text-black',
      textSub: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
      card: isDarkMode ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-black/5 shadow-sm',
      navBtn: isDarkMode ? 'bg-[#2c2c2e] text-zinc-300 border-transparent' : 'bg-white text-zinc-600 shadow-sm border-white',
      orbitRing: isDarkMode ? 'border-white/10' : 'border-black/5',
      profileBg: isDarkMode ? 'bg-[#1c1c1e] border-black' : 'bg-white border-white',
  };

  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);

  useEffect(() => {
    if (availableWorkouts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentWorkoutIndex((prev) => (prev + 1) % availableWorkouts.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [availableWorkouts.length]);

  const handleNotificationClick = (notif: AppNotification) => {
      setShowNotifications(false);
      if (notif.actionScreen) {
          if (notif.type === 'workout' && notif.dataId) {
             onStartWorkout(notif.dataId);
          } else {
             onNavigate(notif.actionScreen);
          }
      }
  };

  const handleToggleNotifications = () => {
      if (!showNotifications && onMarkNotificationsRead) {
          onMarkNotificationsRead();
      }
      setShowNotifications(!showNotifications);
  };

  const currentSelection = availableWorkouts.length > 0 ? availableWorkouts[currentWorkoutIndex] : null;

  return (
    <div className={`min-h-screen ${theme.bg} pb-safe relative overflow-x-hidden transition-colors duration-500`}>
      
      {/* Subtle Gradient Spotlights */}
      <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-${themeColor}-500/20 blur-[120px] pointer-events-none rounded-full`}></div>
      <div className={`absolute top-[20%] right-[-20%] w-[60%] h-[40%] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full`}></div>

      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-center relative z-10" id="header-stats">
        <div>
          <h1 className={`text-4xl font-extrabold ${theme.text} tracking-tight leading-none`}>
            Ciao, <span className={`text-${themeColor}-500`}>{firstName}</span>
          </h1>
          <p className={`text-sm font-medium ${theme.textSub} mt-1`}>
              Pronto a superare i tuoi limiti?
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
              id="btn-notifications"
              onClick={handleToggleNotifications}
              className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-transform active:scale-95 ${isDarkMode ? 'bg-[#2c2c2e]' : 'bg-white shadow-sm'}`}
            >
              {showNotifications ? <X size={20} className={theme.textSub} /> : <Bell size={20} className={theme.textSub} />}
              {unreadCount > 0 && !showNotifications && (
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-[2px] border-black flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{unreadCount}</span>
                 </div>
              )}
            </button>
        </div>
      </div>

      {/* AI COACH MODAL */}
      {showAICoach && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" onClick={() => setShowAICoach(false)}>
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-md animate-in fade-in duration-300`}></div>
              <div className="relative z-10 max-w-xs w-full bg-[#1c1c1e] border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAICoach(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                  
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20`}>
                      <Bot size={40} className="text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-black text-white mb-2 italic tracking-tight">
                      AI Coach
                  </h2>
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-white mb-4 uppercase tracking-widest">
                      Coming Soon
                  </div>
                  
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      Il tuo personal trainer intelligente è in fase di addestramento. Presto potrà correggere la tua forma e ottimizzare i tuoi piani in tempo reale.
                  </p>
              </div>
          </div>
      )}

      {/* NOTIFICATION SHEET */}
      {showNotifications && (
          <div className="absolute top-28 left-4 right-4 z-50 animate-scale-in origin-top-right">
              <div className={`${theme.card} rounded-3xl p-5 border shadow-2xl backdrop-blur-xl bg-opacity-95`}>
                  <h3 className={`font-bold ${theme.text} mb-4 ml-1 text-lg`}>Centro Notifiche</h3>
                  {notifications.length === 0 ? (
                      <p className={`text-sm ${theme.textSub} py-4 text-center`}>Tutto tranquillo per ora.</p>
                  ) : (
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                          {notifications.map(notif => (
                              <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`flex gap-4 p-3 rounded-2xl transition-colors cursor-pointer active:scale-98 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'badge_unlock' ? 'bg-yellow-500' : `bg-${themeColor}-500`}`}>
                                      {notif.type === 'workout' ? <Dumbbell size={18} className="text-white"/> : notif.type === 'badge_unlock' ? <Star size={18} className="text-white"/> : <Swords size={18} className="text-white"/>}
                                  </div>
                                  <div>
                                      <p className={`font-bold text-sm ${theme.text}`}>{notif.title}</p>
                                      <p className={`text-xs ${theme.textSub} mt-0.5 leading-snug`}>{notif.message}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* ORBIT NAVIGATION */}
      <div className="relative h-[300px] w-full flex justify-center items-center my-4">
        <div className={`absolute w-[280px] h-[280px] rounded-full border ${theme.orbitRing} opacity-50`}></div>
        <div className={`absolute w-[190px] h-[190px] rounded-full border ${theme.orbitRing} opacity-80`}></div>
        
        <div 
            id="orbit-profile"
            onClick={() => onNavigate('profile')}
            className={`w-28 h-28 rounded-full p-1.5 cursor-pointer relative z-20 transition-transform active:scale-95 shadow-2xl ${theme.profileBg}`}
        >
            <div className="w-full h-full rounded-full overflow-hidden relative">
                {userProfile.image ? (
                    <img src={userProfile.image} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}><User size={40} className={theme.textSub}/></div>
                )}
            </div>
            {userStats.workoutsCompleted > 0 && (
                <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-[4px] ${isDarkMode ? 'border-black' : 'border-[#f2f2f7]'} bg-${themeColor}-500 flex items-center justify-center text-black`}>
                    <CheckCircle2 size={16} strokeWidth={3} />
                </div>
            )}
        </div>

        {/* ORBIT ICONS */}
        <button onClick={() => onNavigate('calendar')} className={`absolute top-4 w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-lg transition-transform active:scale-90 ${theme.navBtn}`}>
            <CalendarIcon size={18} className={`text-${themeColor}-500`} />
        </button>

        {/* AI Coach Button - Placed at Top Right Satellite Position */}
        <button 
            onClick={() => setShowAICoach(true)}
            className={`absolute top-12 right-20 w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-lg transition-transform active:scale-90 ${theme.navBtn}`}
        >
            <Bot size={18} className={`text-${themeColor}-500`} />
        </button>

        <button onClick={() => onNavigate('profile')} className={`absolute left-8 w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-lg transition-transform active:scale-90 ${theme.navBtn}`}>
            <BarChart2 size={18} className={`text-${themeColor}-500`} />
        </button>

        <button onClick={() => onNavigate('community')} className={`absolute right-8 w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-md shadow-lg transition-transform active:scale-90 ${theme.navBtn}`}>
            <Users size={18} className={`text-${themeColor}-500`} />
        </button>

        <div className="absolute bottom-0 z-30" id="action-workout-main">
            <button 
                onClick={() => onNavigate('workout')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full bg-${themeColor}-500 text-slate-950 font-black text-base shadow-[0_0_30px_-5px_rgba(var(--theme-color),0.6)] transition-all hover:scale-105 active:scale-95 border-2 border-transparent hover:border-white/20`}
                style={{
                    boxShadow: `0 0 30px -5px ${themeColor === 'rose' ? 'rgba(244, 63, 94, 0.6)' : 'rgba(16, 185, 129, 0.6)'}`
                }}
            >
                <Dumbbell size={20} fill="currentColor" />
                <span>ALLENATI</span>
            </button>
        </div>
      </div>

      {/* WIDGETS SECTION */}
      <div className="px-6 space-y-4">
        
        {/* Next Workout Card */}
        <div 
            id="card-next-workout"
            onClick={() => currentSelection && onStartWorkout(currentSelection.id)}
            className={`w-full rounded-3xl p-6 border relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all duration-300 ${theme.card}`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textSub} flex items-center gap-1.5 mb-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500`}></span>
                        Consigliato per oggi
                    </span>
                    <h2 className={`text-2xl font-bold ${theme.text} leading-tight max-w-[200px]`}>
                        {currentSelection ? currentSelection.title : 'Genera Scheda'}
                    </h2>
                    {currentSelection && <p className={`text-xs font-medium ${theme.textSub} mt-1`}>{currentSelection.category} • {currentSelection.exercises.length} Esercizi</p>}
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                    <ArrowRight size={24} />
                </div>
            </div>
            
            <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${themeColor}-500/20 blur-[50px] rounded-full pointer-events-none`}></div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
            <div className={`p-5 rounded-3xl border flex flex-col justify-between aspect-square ${theme.card}`} id="widget-streak">
                <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500`}>
                        <Flame size={20} fill="currentColor" />
                    </div>
                </div>
                <div>
                    <span className={`text-3xl font-bold ${theme.text} block`}>{userStats.streak}</span>
                    <span className={`text-xs font-medium ${theme.textSub}`}>Day Streak</span>
                </div>
            </div>

            <div className={`p-5 rounded-3xl border flex flex-col justify-between aspect-square ${theme.card}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500`}>
                    <TrendingUp size={20} />
                </div>
                <div>
                    <span className={`text-3xl font-bold ${theme.text} block`}>{userStats.workoutsCompleted}</span>
                    <span className={`text-xs font-medium ${theme.textSub}`}>Workouts</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
