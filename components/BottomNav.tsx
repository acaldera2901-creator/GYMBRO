import React from 'react';
import { Home, Calendar, Dumbbell, User, Users } from 'lucide-react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  isDarkMode: boolean;
  themeColor: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, isDarkMode, themeColor }) => {
  const isRose = themeColor === 'rose';
  const accentHex = isRose ? '#f43f5e' : '#10b981';

  const navItems = [
    { screen: 'home' as ScreenName, icon: Home, id: 'nav-home', label: 'Home' },
    { screen: 'calendar' as ScreenName, icon: Calendar, id: 'nav-calendar', label: 'Piano' },
    { screen: 'workout' as ScreenName, icon: Dumbbell, id: 'nav-community', label: 'Allena', isCenter: true },
    { screen: 'community' as ScreenName, icon: Users, id: 'nav-workout', label: 'Social' },
    { screen: 'profile' as ScreenName, icon: User, id: 'nav-profile', label: 'Profilo' },
  ];

  const HIDE_ON = ['login', 'profile-config', 'goal-selection', 'strength-test', 'preferences', 'plan-generation', 'custom-workout-builder'];
  if (HIDE_ON.includes(currentScreen)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pb-3">
      <div className="pointer-events-auto w-full max-w-sm bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/60 rounded-[2rem] px-5 py-3 flex items-center justify-between shadow-2xl shadow-black/40">
        {navItems.map(({ screen, icon: Icon, id, label, isCenter }) => {
          const isActive = currentScreen === screen;
          if (isCenter) {
            return (
              <button key={screen} id={id} onClick={() => onNavigate(screen)}
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-90 shadow-lg"
                style={{
                  backgroundColor: accentHex,
                  boxShadow: `0 0 20px ${accentHex}50`
                }}>
                <Icon size={24} strokeWidth={2.5} className="text-black" />
                {isActive && <div className="absolute -bottom-3 w-1 h-1 rounded-full bg-black/50" />}
              </button>
            );
          }
          return (
            <button key={screen} id={id} onClick={() => onNavigate(screen)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-90">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? accentHex : '#52525b' }} />
              <span className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: isActive ? accentHex : '#52525b' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
