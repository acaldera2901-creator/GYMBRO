
import React from 'react';
import { Home, Calendar, Dumbbell, User, Users } from 'lucide-react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  isDarkMode: boolean;
  themeColor: string;
}

const HIDE_ON: ScreenName[] = [
  'login', 'profile-config', 'goal-selection',
  'strength-test', 'preferences', 'plan-generation', 'custom-workout-builder',
];

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, isDarkMode, themeColor }) => {
  const isRose = themeColor === 'rose';
  const accentHex = isRose ? '#f43f5e' : '#C8FF00'; // lime instead of emerald

  if (HIDE_ON.includes(currentScreen)) return null;

  const navItems = [
    { screen: 'home'      as ScreenName, icon: Home,    label: 'Home' },
    { screen: 'calendar'  as ScreenName, icon: Calendar, label: 'Piano' },
    { screen: 'workout'   as ScreenName, icon: Dumbbell, label: 'Allena', isCenter: true },
    { screen: 'community' as ScreenName, icon: Users,   label: 'Social' },
    { screen: 'profile'   as ScreenName, icon: User,    label: 'Profilo' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: 398,
      zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        background: 'rgba(12,12,18,0.94)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: 26, padding: '10px 16px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        marginBottom: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {navItems.map(({ screen, icon: Icon, label, isCenter }) => {
          const isActive = currentScreen === screen;

          if (isCenter) {
            return (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                style={{
                  width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                  background: isRose ? '#f43f5e' : '#C8FF00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', marginTop: -12,
                  boxShadow: isRose
                    ? '0 0 24px rgba(244,63,94,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 0 24px rgba(200,255,0,0.3), 0 4px 12px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Icon size={24} strokeWidth={2.5} style={{ color: '#000' }} />
              </button>
            );
          }

          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer', flex: 1, background: 'none', border: 'none',
                color: isActive ? accentHex : '#52525b',
                padding: '4px 0',
                transition: 'color 0.2s, transform 0.15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                style={{ color: isActive ? accentHex : '#52525b' }}
              />
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: isActive ? accentHex : '#52525b',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
