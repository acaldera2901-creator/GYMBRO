import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bell, Moon, ChevronRight, User, X, Sun, Flame, Dumbbell, Calendar,
  Clock, Trash2, Camera, Check, Loader2, ChevronUp, ChevronDown, Lock,
  Award, Target, TrendingUp, Edit2, Zap, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserProfile, UserStats, WorkoutCard, Badge } from '../types';
import { SecureStorageManager } from '../lib/secureStorage';
import { updateProfileField, updateUserStats } from '../lib/supabase';

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
    onProfileUpdated?: (profile: Partial<UserProfile>, stats: Partial<UserStats>) => void;
}

const PREF_OPTIONS = [
    { id: 'Panca Piana', label: 'Panca Piana', group: 'CHEST' },
    { id: 'Squat', label: 'Squat', group: 'LEGS' },
    { id: 'Trazioni', label: 'Trazioni', group: 'BACK' },
    { id: 'Military Press', label: 'Military', group: 'SHOULDERS' },
    { id: 'Stacco', label: 'Stacco', group: 'BACK' },
    { id: 'Curl Bicipiti', label: 'Curl', group: 'ARMS' },
];

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────
const EditProfileModal: React.FC<{
    userProfile: UserProfile;
    userStats: UserStats;
    themeColor: string;
    onClose: () => void;
    onSave: (profile: Partial<UserProfile>, stats: Partial<UserStats>) => Promise<void>;
}> = ({ userProfile, userStats, themeColor, onClose, onSave }) => {
    const [weight, setWeight] = useState(String(userProfile.weight || ''));
    const [image, setImage] = useState<string | undefined>(userProfile.image);
    const [favorites, setFavorites] = useState<string[]>(userProfile.favoriteExercises || []);
    const [bench, setBench] = useState<string | null>(userStats.maxes?.bench ? String(userStats.maxes.bench) : null);
    const [squat, setSquat] = useState<string | null>(userStats.maxes?.squat ? String(userStats.maxes.squat) : null);
    const [deadlift, setDeadlift] = useState<string | null>(userStats.maxes?.deadlift ? String(userStats.maxes.deadlift) : null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const accentBg = themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500';
    const accentText = themeColor === 'rose' ? 'text-rose-400' : 'text-emerald-400';

    const toggleFavorite = (id: string) =>
        setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const adjustMaxValue = (setter: React.Dispatch<React.SetStateAction<string | null>>, current: string | null, delta: number) => {
        const val = parseFloat(current || '0') || 0;
        setter(String(Math.max(2.5, Math.round((val + delta) / 2.5) * 2.5)));
    };

    const normalizeMax = (setter: React.Dispatch<React.SetStateAction<string | null>>, current: string | null, fallback = 60) => {
        if (current === null) return;
        const raw = parseFloat(current);
        setter(isNaN(raw) || raw <= 0 ? String(fallback) : String(Math.max(2.5, Math.round(raw / 2.5) * 2.5)));
    };

    const adjustWeight = (delta: number) => {
        const v = parseFloat(weight) || 75;
        setWeight(String(Math.max(30, Math.min(300, Math.round((v + delta) * 2) / 2))));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const wNum = parseFloat(weight);
        if (!weight || isNaN(wNum) || wNum < 30 || wNum > 300) { setError('Peso valido (30–300 kg)'); return; }
        setIsSaving(true); setError(null);
        try {
            await onSave(
                { weight: wNum, image, favoriteExercises: favorites },
                { weight: wNum, maxes: {
                    bench:    bench    !== null ? (parseFloat(bench)    || 0) : (userStats.maxes?.bench    || 0),
                    squat:    squat    !== null ? (parseFloat(squat)    || 0) : (userStats.maxes?.squat    || 0),
                    deadlift: deadlift !== null ? (parseFloat(deadlift) || 0) : (userStats.maxes?.deadlift || 0),
                }}
            );
            onClose();
        } catch (err: any) { setError(err.message || 'Errore.'); setIsSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-zinc-950 rounded-t-[2rem] max-h-[93vh] flex flex-col overflow-hidden">
                <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-zinc-800 rounded-full" /></div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                    <h2 className="text-xl font-black text-white">Modifica Profilo</h2>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                        <X size={16} className="text-zinc-400" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-7 pt-4">

                    {/* Foto profilo */}
                    <div className="flex flex-col items-center">
                        <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-950">
                                {image ? (
                                    <img src={image} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <User size={44} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            {/* Overlay al hover */}
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera size={22} className="text-white" />
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 ${accentBg} rounded-full flex items-center justify-center border-2 border-zinc-950`}>
                                <Camera size={13} className="text-white" />
                            </div>
                        </div>
                        <p className="text-zinc-600 text-xs mt-2.5">Tocca per cambiare foto</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    {/* Dati fissi */}
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock size={11} className="text-zinc-700" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Dati Anagrafici</span>
                        </div>
                        <div className="flex gap-6">
                            {[{ label: 'Nome', val: userProfile.name }, { label: 'Genere', val: userProfile.gender }].map(({ label, val }) => (
                                <div key={label}>
                                    <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1">{label}</p>
                                    <p className="text-white font-semibold text-sm">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Peso */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2.5">Peso Attuale</label>
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center overflow-hidden">
                            <button onClick={() => adjustWeight(-0.5)} className="w-14 h-16 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                                <ChevronDown size={22} />
                            </button>
                            <div className="flex-1 flex flex-col items-center">
                                <input
                                    type="number" value={weight} onChange={e => setWeight(e.target.value)}
                                    onBlur={() => { const v = parseFloat(weight); if (isNaN(v) || v < 30) setWeight('30'); else if (v > 300) setWeight('300'); }}
                                    className="bg-transparent text-white text-3xl font-black text-center w-full focus:outline-none"
                                    inputMode="decimal"
                                />
                                <span className="text-zinc-600 text-xs font-bold uppercase tracking-wider -mt-1">kg</span>
                            </div>
                            <button onClick={() => adjustWeight(0.5)} className="w-14 h-16 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                                <ChevronUp size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Massimali */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2.5">Massimali 1RM</label>
                        <div className="space-y-2.5">
                            {([
                                { label: 'Panca', emoji: '🏋️', value: bench, setter: setBench, fallback: 60 },
                                { label: 'Squat', emoji: '🦵', value: squat, setter: setSquat, fallback: 80 },
                                { label: 'Stacco', emoji: '⚡', value: deadlift, setter: setDeadlift, fallback: 100 },
                            ] as any[]).map(({ label, emoji, value, setter, fallback }) => (
                                <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center px-4 py-3 gap-3">
                                    <span className="text-xl">{emoji}</span>
                                    <span className="text-white font-bold text-sm flex-1">{label}</span>
                                    {value === null ? (
                                        <button
                                            onClick={() => setter(String(fallback))}
                                            className="text-xs font-bold text-zinc-500 border border-zinc-700 rounded-xl px-3 py-1.5 hover:border-zinc-500 hover:text-zinc-300 transition-all active:scale-95"
                                        >+ Aggiungi</button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => adjustMaxValue(setter, value, -2.5)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 active:scale-95 transition-all font-bold text-lg">−</button>
                                            <div className="flex items-baseline gap-1 w-20 justify-center">
                                                <input
                                                    type="number" value={value} onChange={e => setter(e.target.value)}
                                                    onBlur={() => normalizeMax(setter, value, fallback)}
                                                    className="bg-transparent text-white font-black text-lg text-center w-14 focus:outline-none"
                                                    inputMode="decimal"
                                                />
                                                <span className="text-zinc-600 text-xs">kg</span>
                                            </div>
                                            <button onClick={() => adjustMaxValue(setter, value, 2.5)} className={`w-8 h-8 rounded-full ${accentBg} flex items-center justify-center text-white active:scale-95 transition-all font-bold text-lg`}>+</button>
                                            <button onClick={() => setter(null)} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all ml-1">×</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Esercizi preferiti */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2.5">Esercizi Preferiti</label>
                        <div className="grid grid-cols-3 gap-2">
                            {PREF_OPTIONS.map(opt => {
                                const isSelected = favorites.includes(opt.id);
                                return (
                                    <button key={opt.id} onClick={() => toggleFavorite(opt.id)}
                                        className={`py-3 px-2 rounded-2xl border text-center transition-all active:scale-95 ${isSelected ? `border-zinc-600 text-white bg-zinc-800` : 'border-zinc-800 text-zinc-500 bg-zinc-900'}`}>
                                        <p className="font-bold text-xs leading-tight">{opt.label}</p>
                                        <p className="text-[9px] opacity-50 mt-0.5">{opt.group}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">{error}</div>}
                </div>

                {/* Save button */}
                <div className="px-6 pt-4 pb-10 bg-zinc-950 border-t border-zinc-800/50" style={{paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom) + 1rem))'}}>
                    <button onClick={handleSave} disabled={isSaving}
                        className={`w-full ${accentBg} disabled:opacity-40 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm`}>
                        {isSaving ? <><Loader2 size={18} className="animate-spin" /> SALVATAGGIO...</> : <><Check size={18} strokeWidth={3} /> SALVA MODIFICHE</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── BADGE CARD ───────────────────────────────────────────────────────────────
const BadgeCard: React.FC<{ badge: Badge; themeColor: string }> = ({ badge, themeColor }) => {
    const tierColors: Record<string, string> = {
        locked: '#3f3f46', bronze: '#b45309', silver: '#9ca3af', gold: '#d97706', diamond: '#06b6d4', legendary: '#a855f7'
    };
    const color = tierColors[badge.tier] || tierColors.locked;
    const isLocked = badge.tier === 'locked';
    const progress = badge.nextThreshold && badge.currentValue !== undefined
        ? Math.min(100, (badge.currentValue / badge.nextThreshold) * 100) : 0;

    return (
        <div className={`rounded-2xl p-3.5 border flex flex-col gap-2 ${isLocked ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-800/70 border-zinc-700'}`}>
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Award size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">{badge.title}</p>
                    <p className="text-[10px]" style={{ color }}>{badge.tier === 'locked' ? 'Bloccato' : badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}</p>
                </div>
            </div>
            {badge.nextThreshold && badge.currentValue !== undefined && (
                <div>
                    <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-[9px] text-zinc-600 mt-1">{badge.currentValue}/{badge.nextThreshold}</p>
                </div>
            )}
        </div>
    );
};

// ─── CIRCULAR PROGRESS ────────────────────────────────────────────────────────
const CircularProgress: React.FC<{ value: number; size?: number; strokeWidth?: number; color: string }> = ({ value, size = 64, strokeWidth = 5, color }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
    );
};

// ─── MAIN PROFILE SCREEN ─────────────────────────────────────────────────────
const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onLogout, userProfile, userStats, isDarkMode, toggleTheme,
    onEditProfile, themeColor, workoutSchedule = {}, onDeleteWorkout, onProfileUpdated
}) => {
    const [showEdit, setShowEdit] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifSettings, setNotifSettings] = useState({ dailyReminder: true, sound: true, vibration: true });
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'history'>('stats');

    // FIX: immagine aggiornamento immediato
    const [localImage, setLocalImage] = useState<string | undefined>(userProfile.image);
    useEffect(() => { setLocalImage(userProfile.image); }, [userProfile.image]);
    useEffect(() => { setBiometricsEnabled(SecureStorageManager.isBiometricsEnabled()); }, []);

    const isRose = themeColor === 'rose';
    const accentHex = isRose ? '#f43f5e' : '#10b981';
    const accent = isRose ? 'text-rose-400' : 'text-emerald-400';
    const accentBg = isRose ? 'bg-rose-500' : 'bg-emerald-500';
    const accentFill = accentHex;

    const handleToggleBiometrics = () => {
        const v = !biometricsEnabled;
        setBiometricsEnabled(v);
        SecureStorageManager.setBiometricsEnabled(v);
    };

    const handleSaveProfile = async (profileUpdates: Partial<UserProfile>, statsUpdates: Partial<UserStats>) => {
        if (!userProfile.id) throw new Error('Utente non trovato.');
        // FIX: aggiorna immagine locale subito
        if (profileUpdates.image !== undefined) setLocalImage(profileUpdates.image);
        await updateProfileField(userProfile.id, {
            weight: profileUpdates.weight, image: profileUpdates.image, favorite_exercises: profileUpdates.favoriteExercises,
        });
        await updateUserStats(userProfile.id, statsUpdates);
        if (onProfileUpdated) onProfileUpdated(profileUpdates, statsUpdates);
    };

    // Chart data
    const { chartData, weeklyTotalMinutes } = useMemo(() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const dow = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
        const labels = ['L','M','M','G','V','S','D'];
        let totalSecs = 0;
        const data = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday); d.setDate(monday.getDate() + i);
            const dk = d.toLocaleDateString('en-CA');
            const completed = ((workoutSchedule[dk] as WorkoutCard[]) || []).filter(w => w.isCompleted || w.id.startsWith('done_'));
            const secs = completed.reduce((a, w) => a + (w.completedDuration || 0), 0);
            totalSecs += secs;
            return { name: labels[i], minutes: Math.round(secs / 60), fullDate: dk };
        });
        return { chartData: data, weeklyTotalMinutes: Math.floor(totalSecs / 60) };
    }, [workoutSchedule]);

    const recentHistory = useMemo(() => {
        const dayNames = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
        const history: any[] = [];
        Object.entries(workoutSchedule).forEach(([dk, workouts]) => {
            (workouts as WorkoutCard[]).filter(w => w.isCompleted || w.id.startsWith('done_')).forEach(w => {
                const d = new Date(dk);
                history.push({ id: w.id, date: dk, dayName: dayNames[d.getDay()], dayNum: d.getDate(), title: w.title, duration: w.completedDuration || 0, category: w.category });
            });
        });
        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workoutSchedule]);

    // Calcola badge sbloccati
    const unlockedBadges = userStats.badges?.filter(b => b.tier !== 'locked') || [];
    const totalBadges = userStats.badges?.length || 0;
    const badgeProgress = totalBadges > 0 ? (unlockedBadges.length / totalBadges) * 100 : 0;

    // Weekly goal (esempio: 3 sessioni/settimana)
    const weeklyGoal = userProfile.trainingDays?.length || 3;
    const weeklyDone = chartData.filter(d => d.minutes > 0).length;
    const weeklyGoalPct = Math.min(100, (weeklyDone / weeklyGoal) * 100);

    if (showNotifications) {
        return (
            <div className="min-h-screen bg-black flex flex-col">
                <div className="px-6 pt-14 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Notifiche</h2>
                    <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full bg-zinc-800 text-white"><X size={20} /></button>
                </div>
                <div className="px-4 mt-4">
                    <div className="bg-zinc-900 rounded-2xl overflow-hidden">
                        <SettingsToggle label="Promemoria Giornaliero" desc="Notifica alle 09:00" active={notifSettings.dailyReminder} onToggle={() => setNotifSettings(p=>({...p,dailyReminder:!p.dailyReminder}))} color={themeColor} isLast={false} />
                        <SettingsToggle label="Suoni App" desc="Effetti sonori" active={notifSettings.sound} onToggle={() => setNotifSettings(p=>({...p,sound:!p.sound}))} color={themeColor} isLast={false} />
                        <SettingsToggle label="Vibrazione" desc="Feedback aptico" active={notifSettings.vibration} onToggle={() => setNotifSettings(p=>({...p,vibration:!p.vibration}))} color={themeColor} isLast={true} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] pb-32">

            {showEdit && (
                <EditProfileModal userProfile={userProfile} userStats={userStats} themeColor={themeColor} onClose={() => setShowEdit(false)} onSave={handleSaveProfile} />
            )}

            {/* ── HERO HEADER ──────────────────────────────────── */}
            <div className="relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0" style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${accentHex}18 0%, transparent 70%)`
                }} />

                <div className="relative px-5 pt-14 pb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-black text-white">Profilo</h1>
                        <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-800 rounded-xl px-3 py-2 hover:bg-zinc-700 transition-colors active:scale-95">
                            <Edit2 size={12} /> Modifica
                        </button>
                    </div>

                    {/* Avatar + info */}
                    <div className="flex items-end gap-4">
                        <div className="relative">
                            {/* Progress ring attorno all'avatar */}
                            <div className="absolute -inset-1.5">
                                <CircularProgress value={weeklyGoalPct} size={104} strokeWidth={3} color={accentHex} />
                            </div>
                            <div className="w-[76px] h-[76px] rounded-full overflow-hidden ring-2 ring-zinc-800 m-[7px]">
                                {localImage ? (
                                    <img src={localImage} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <User size={34} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-0 -right-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: accentHex }}>
                                <Zap size={11} className="text-black" />
                            </div>
                        </div>

                        <div className="flex-1 pb-1">
                            <h2 className="text-xl font-black text-white">{userProfile.name || 'Atleta'}</h2>
                            <p className="text-zinc-500 text-xs mt-0.5">{userProfile.goal ? `Obiettivo: ${userProfile.goal}` : ''}</p>
                            {/* Weekly progress inline */}
                            <div className="flex items-center gap-1.5 mt-2">
                                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${weeklyGoalPct}%`, backgroundColor: accentHex }} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500">{weeklyDone}/{weeklyGoal} questa settimana</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats row compatto */}
                    <div className="grid grid-cols-3 gap-2.5 mt-5">
                        {[
                            { icon: <Flame size={16} fill="currentColor" className="text-orange-400" />, value: userStats.streak, label: 'Streak', sub: 'giorni' },
                            { icon: <Dumbbell size={16} className={accent} />, value: userStats.workoutsCompleted, label: 'Workout', sub: 'totali' },
                            { icon: <Clock size={16} className="text-blue-400" />, value: `${Math.floor(userStats.activeMinutes / 60)}`, label: 'Ore', sub: 'attive' },
                        ].map(({ icon, value, label, sub }) => (
                            <div key={label} className="bg-zinc-900 rounded-2xl p-3.5 border border-zinc-800/60 flex flex-col items-center gap-1">
                                {icon}
                                <span className="text-xl font-black text-white leading-none">{value}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TABS ───────────────────────────────────────────── */}
            <div className="px-5 mt-1">
                <div className="bg-zinc-900 rounded-2xl p-1 flex gap-1">
                    {([
                        { id: 'stats', icon: BarChart2, label: 'Statistiche' },
                        { id: 'badges', icon: Award, label: `Badge (${unlockedBadges.length})` },
                        { id: 'history', icon: Calendar, label: 'Storico' },
                    ] as const).map(({ id, icon: Icon, label }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === id ? 'bg-zinc-800 text-white' : 'text-zinc-600'
                            }`}>
                            <Icon size={13} />
                            <span className="truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-5 mt-4 space-y-4">

                {/* ── TAB: STATISTICHE ─────────────────────────── */}
                {activeTab === 'stats' && (
                    <>
                        {/* Massimali */}
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 overflow-hidden">
                            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                                <Target size={13} className="text-zinc-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Massimali 1RM</p>
                            </div>
                            {[
                                { label: 'Panca', emoji: '🏋️', value: userStats.maxes?.bench },
                                { label: 'Squat', emoji: '🦵', value: userStats.maxes?.squat },
                                { label: 'Stacco', emoji: '⚡', value: userStats.maxes?.deadlift },
                            ].map(({ label, emoji, value }, i) => {
                                const max = { Panca: 200, Squat: 250, Stacco: 300 }[label] || 200;
                                const pct = value ? Math.min(100, (value / max) * 100) : 0;
                                return (
                                    <div key={label} className={`px-4 py-3 flex items-center gap-3 ${i < 2 ? 'border-b border-zinc-800/60' : ''}`}>
                                        <span className="text-lg w-7 text-center">{emoji}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-zinc-300">{label}</span>
                                                <span className={`text-base font-black ${accent}`}>{value || 0}<span className="text-xs text-zinc-600 ml-0.5">kg</span></span>
                                            </div>
                                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: accentHex }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart */}
                        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800/60">
                            <div className="flex justify-between items-baseline mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Attività Settimanale</h3>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Questa settimana</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${accent}`} style={{ backgroundColor: `${accentHex}15` }}>
                                    {Math.floor(weeklyTotalMinutes / 60)}h {weeklyTotalMinutes % 60}m
                                </span>
                            </div>
                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10, fontWeight: 'bold' }} dy={8} />
                                        <Tooltip cursor={{ fill: '#27272a', radius: 6 }} content={({ active, payload }) => active && payload?.length ? (
                                            <div className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-white">{payload[0].payload.minutes} min</div>
                                        ) : null} />
                                        <Bar dataKey="minutes" radius={[5,5,5,5]} barSize={22}>
                                            {chartData.map((e, i) => <Cell key={i} fill={e.minutes > 0 ? accentFill : '#1f1f23'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {/* ── TAB: BADGE ───────────────────────────────── */}
                {activeTab === 'badges' && (
                    <>
                        {/* Riepilogo */}
                        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800/60 flex items-center gap-4">
                            <CircularProgress value={badgeProgress} size={56} strokeWidth={4} color={accentHex} />
                            <div>
                                <p className="text-white font-black text-lg">{unlockedBadges.length}<span className="text-zinc-600 font-medium text-sm">/{totalBadges}</span></p>
                                <p className="text-zinc-500 text-xs">Badge sbloccati</p>
                                <p className="text-[10px] text-zinc-600 mt-0.5">{totalBadges - unlockedBadges.length} ancora da sbloccare</p>
                            </div>
                        </div>

                        {/* Badge grid */}
                        {userStats.badges && userStats.badges.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2.5">
                                {userStats.badges.map(badge => (
                                    <BadgeCard key={badge.id} badge={badge} themeColor={themeColor} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-dashed border-zinc-800">
                                <Award size={28} className="mx-auto mb-2 text-zinc-700" />
                                <p className="text-sm text-zinc-500">Completa allenamenti per sbloccare badge!</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── TAB: STORICO ────────────────────────────── */}
                {activeTab === 'history' && (
                    <>
                        {recentHistory.length === 0 ? (
                            <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-dashed border-zinc-800">
                                <Calendar size={28} className="mx-auto mb-2 text-zinc-700" />
                                <p className="text-sm text-zinc-500">Nessun allenamento completato.</p>
                            </div>
                        ) : (
                            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60">
                                {recentHistory.slice(0, 10).map((item, i) => (
                                    <div key={item.id} className={`flex items-center gap-3 p-3.5 ${i < Math.min(recentHistory.length, 10) - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                                        <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 bg-zinc-800">
                                            <span className="text-[9px] font-bold uppercase text-zinc-500">{item.dayName}</span>
                                            <span className="text-sm font-black text-white">{item.dayNum}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate text-white">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                <span className={`font-bold ${accent}`}>{item.category}</span>
                                                <span>·</span>
                                                <span>{Math.round(item.duration / 60)} min</span>
                                            </p>
                                        </div>
                                        {onDeleteWorkout && (
                                            <button onClick={() => onDeleteWorkout(item.id, item.date)} className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── IMPOSTAZIONI (sempre visibili sotto i tab) ── */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2.5 pl-1">Impostazioni</p>
                    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60">
                        <SettingsToggle label="FaceID all'avvio" desc="Maggiore sicurezza account" active={biometricsEnabled} onToggle={handleToggleBiometrics} color={themeColor} isLast={false} />
                        <div className="h-px bg-zinc-800/60 ml-4" />
                        <div onClick={() => setShowNotifications(true)} className="flex items-center justify-between p-4 cursor-pointer active:opacity-70 bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-700/50 text-zinc-400"><Bell size={16} /></div>
                                <span className="text-white text-sm font-medium">Notifiche</span>
                            </div>
                            <ChevronRight size={15} className="text-zinc-600" />
                        </div>
                        <div className="h-px bg-zinc-800/60 ml-4" />
                        <div className="flex items-center justify-between p-4 cursor-pointer bg-zinc-900" onClick={toggleTheme}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                                    {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                                </div>
                                <span className="text-white text-sm font-medium">Dark Mode</span>
                            </div>
                            <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? accentBg : 'bg-zinc-600'}`}>
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`} />
                            </div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full mt-4 py-3 text-red-500 font-medium text-sm bg-transparent hover:bg-red-500/10 rounded-xl transition-colors">
                        Esci dall'account
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsToggle = ({ label, desc, active, onToggle, color, isLast }: any) => (
    <div className="flex items-center justify-between p-4 bg-zinc-900">
        <div>
            <p className="font-medium text-white text-sm">{label}</p>
            <p className="text-xs text-zinc-600">{desc}</p>
        </div>
        <button onClick={onToggle} className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${active ? (color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-zinc-700'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
    </div>
);

export default ProfileScreen;
