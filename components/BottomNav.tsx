
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
  const navItems = [
    { screen: 'home', icon: Home, id: 'nav-home' },
    { screen: 'calendar', icon: Calendar, id: 'nav-calendar' },
    { screen: 'community', icon: Users, isCenter: true, id: 'nav-community' },
    { screen: 'workout', icon: Dumbbell, id: 'nav-workout' },
    { screen: 'profile', icon: User, id: 'nav-profile' },
  ];

  if (currentScreen === 'login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-safe px-4 mb-2">
      <div className={`pointer-events-auto flex items-center justify-between px-6 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border transition-all duration-300 w-full max-w-sm ${
          isDarkMode 
          ? 'bg-zinc-900/80 border-white/10' 
          : 'bg-white/80 border-black/5'
      }`}>
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          
          if (item.isCenter) {
             return (
               <button
                 key={item.screen}
                 id={item.id}
                 onClick={() => onNavigate(item.screen as ScreenName)}
                 className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                     isDarkMode 
                     ? `bg-${themeColor}-500 text-black` 
                     : `bg-${themeColor}-500 text-white`
                 } ${isActive ? 'ring-4 ring-offset-2 ring-offset-black ring-' + themeColor + '-500' : ''}`}
               >
                 <Icon size={26} strokeWidth={2.5} />
               </button>
             );
          }

          return (
            <button
              key={item.screen}
              id={item.id}
              onClick={() => onNavigate(item.screen as ScreenName)}
              className={`p-2 rounded-full transition-all duration-300 active:scale-90 ${
                isActive 
                ? `text-${themeColor}-500 bg-${themeColor}-500/10` 
                : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600')
              }`}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
