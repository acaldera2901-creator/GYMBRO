import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Settings, Bell, Moon, ChevronRight, Edit3, User, X, Sun, Flame, Dumbbell, Calendar, Clock, Trash2, Camera, Check, Loader2, ChevronUp, ChevronDown, ScanFace, Lock } from 'lucide-react';
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

// --- EDIT MODAL ---
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
    // null = mai inserito → mostra "Aggiungi massimale"
    const [bench, setBench] = useState<string | null>(userStats.maxes?.bench ? String(userStats.maxes.bench) : null);
    const [squat, setSquat] = useState<string | null>(userStats.maxes?.squat ? String(userStats.maxes.squat) : null);
    const [deadlift, setDeadlift] = useState<string | null>(userStats.maxes?.deadlift ? String(userStats.maxes.deadlift) : null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const accent = themeColor === 'rose' ? '#f43f5e' : '#10b981';
    const accentBg = themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500';
    const accentText = themeColor === 'rose' ? 'text-rose-500' : 'text-emerald-500';
    const accentBorder = themeColor === 'rose' ? 'border-rose-500' : 'border-emerald-500';

    const toggleFavorite = (id: string) =>
        setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const adjustValue = (setter: React.Dispatch<React.SetStateAction<string | null>>, current: string | null, delta: number) => {
        const val = Math.max(0, parseFloat(current || '0') + delta);
        setter(String(val % 1 === 0 ? val : val.toFixed(1)));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const weightNum = parseFloat(weight);
        if (!weight || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
            setError('Inserisci un peso valido (30–300 kg)');
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const profileUpdates: Partial<UserProfile> = {
                weight: weightNum,
                image,
                favoriteExercises: favorites,
            };
            const statsUpdates: Partial<UserStats> = {
                weight: weightNum,
                maxes: {
                    bench: bench !== null ? (parseFloat(bench) || 0) : (userStats.maxes?.bench || 0),
                    squat: squat !== null ? (parseFloat(squat) || 0) : (userStats.maxes?.squat || 0),
                    deadlift: deadlift !== null ? (parseFloat(deadlift) || 0) : (userStats.maxes?.deadlift || 0),
                }
            };
            await onSave(profileUpdates, statsUpdates);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Errore nel salvataggio.');
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative bg-[#111] rounded-t-[2rem] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-xl font-black text-white">Modifica Profilo</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <X size={16} className="text-zinc-400" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-8">

                    {/* --- FOTO PROFILO --- */}
                    <div className="flex flex-col items-center pt-2">
                        <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-zinc-700">
                                {image ? (
                                    <img src={image} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <User size={48} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-9 h-9 ${accentBg} rounded-full flex items-center justify-center border-4 border-[#111]`}>
                                <Camera size={14} className="text-white" />
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">Tocca per cambiare foto</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    {/* --- DATI NON MODIFICABILI (solo display) --- */}
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock size={12} className="text-zinc-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Dati Anagrafici</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1">Nome</p>
                                <p className="text-white font-semibold text-sm">{userProfile.name}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1">Genere</p>
                                <p className="text-white font-semibold text-sm">{userProfile.gender}</p>
                            </div>
                        </div>
                    </div>

                    {/* --- PESO --- */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">Peso Attuale</label>
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center overflow-hidden">
                            <button onClick={() => adjustValue(setWeight, weight, -0.5)} className="w-14 h-16 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                                <ChevronDown size={22} />
                            </button>
                            <div className="flex-1 flex flex-col items-center">
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    className="bg-transparent text-white text-3xl font-black text-center w-full focus:outline-none"
                                />
                                <span className="text-zinc-600 text-xs font-bold uppercase tracking-wider -mt-1">kg</span>
                            </div>
                            <button onClick={() => adjustValue(setWeight, weight, 0.5)} className="w-14 h-16 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95">
                                <ChevronUp size={22} />
                            </button>
                        </div>
                    </div>

                    {/* --- MASSIMALI --- */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">Massimali</label>
                        <div className="space-y-3">
                            {([
                                { label: 'Panca', emoji: '🏋️', value: bench, setter: setBench },
                                { label: 'Squat', emoji: '🦵', value: squat, setter: setSquat },
                                { label: 'Stacco', emoji: '⚡', value: deadlift, setter: setDeadlift },
                            ] as { label: string; emoji: string; value: string | null; setter: React.Dispatch<React.SetStateAction<string | null>> }[]).map(({ label, emoji, value, setter }) => (
                                <div key={label} className="bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center px-4 py-3 gap-4">
                                    <span className="text-xl">{emoji}</span>
                                    <span className="text-white font-bold text-sm flex-1">{label}</span>
                                    {value === null ? (
                                        // Non ancora inserito → pulsante "Aggiungi"
                                        <button
                                            onClick={() => setter('60')}
                                            className="text-xs font-bold text-zinc-500 border border-zinc-700 rounded-xl px-3 py-1.5 hover:border-zinc-500 hover:text-zinc-300 transition-colors active:scale-95"
                                        >
                                            + Aggiungi
                                        </button>
                                    ) : (
                                        // Inserito → controlli +/-
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => adjustValue(setter, value, -2.5)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 active:scale-95 transition-all font-bold text-lg">−</button>
                                            <div className="flex items-baseline gap-1 w-16 justify-center">
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={e => setter(e.target.value)}
                                                    className="bg-transparent text-white font-black text-lg text-center w-12 focus:outline-none"
                                                />
                                                <span className="text-zinc-600 text-xs">kg</span>
                                            </div>
                                            <button onClick={() => adjustValue(setter, value, 2.5)} className={`w-8 h-8 rounded-full ${accentBg} flex items-center justify-center text-white active:scale-95 transition-all font-bold text-lg`}>+</button>
                                            <button onClick={() => setter(null)} className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all ml-1">×</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- ESERCIZI PREFERITI --- */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">Esercizi Preferiti</label>
                        <div className="grid grid-cols-3 gap-2">
                            {PREF_OPTIONS.map(opt => {
                                const isSelected = favorites.includes(opt.id);
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleFavorite(opt.id)}
                                        className={`py-3 px-2 rounded-2xl border text-center transition-all active:scale-95 ${isSelected ? `border-current ${accentText} bg-zinc-800` : 'border-zinc-800 text-zinc-500 bg-zinc-900'}`}
                                    >
                                        <p className="font-bold text-xs leading-tight">{opt.label}</p>
                                        <p className="text-[9px] opacity-60 mt-0.5">{opt.group}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="px-6 pb-8 pt-4 bg-[#111] border-t border-zinc-800/50">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full ${accentBg} disabled:opacity-50 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
                    >
                        {isSaving ? (
                            <><Loader2 size={20} className="animate-spin" /> SALVATAGGIO...</>
                        ) : (
                            <><Check size={20} strokeWidth={3} /> SALVA MODIFICHE</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PROFILE SCREEN ---
const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onLogout, userProfile, userStats, isDarkMode, toggleTheme,
    onEditProfile, themeColor, workoutSchedule = {}, onDeleteWorkout, onProfileUpdated
}) => {
    const [showEdit, setShowEdit] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifSettings, setNotifSettings] = useState({ dailyReminder: true, sound: true, vibration: true });
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    useEffect(() => { setBiometricsEnabled(SecureStorageManager.isBiometricsEnabled()); }, []);

    const bg = isDarkMode ? 'bg-black' : 'bg-[#f2f2f7]';
    const card = isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white';
    const text = isDarkMode ? 'text-white' : 'text-black';
    const sub = isDarkMode ? 'text-zinc-500' : 'text-zinc-400';
    const accent = themeColor === 'rose' ? 'text-rose-500' : 'text-emerald-500';
    const accentBg = themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500';
    const accentFill = themeColor === 'rose' ? '#f43f5e' : '#10b981';

    const handleToggleBiometrics = () => {
        const v = !biometricsEnabled;
        setBiometricsEnabled(v);
        SecureStorageManager.setBiometricsEnabled(v);
    };

    const handleSaveProfile = async (profileUpdates: Partial<UserProfile>, statsUpdates: Partial<UserStats>) => {
        if (!userProfile.id) throw new Error('Utente non trovato.');
        // Salva su Supabase
        await updateProfileField(userProfile.id, {
            weight: profileUpdates.weight,
            image: profileUpdates.image,
            favorite_exercises: profileUpdates.favoriteExercises,
        });
        await updateUserStats(userProfile.id, statsUpdates);
        // Aggiorna stato in App.tsx
        if (onProfileUpdated) onProfileUpdated(profileUpdates, statsUpdates);
    };

    // --- CHART ---
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

    // --- HISTORY ---
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

    if (showNotifications) {
        return (
            <div className={`min-h-screen ${bg} flex flex-col`}>
                <div className="px-6 pt-14 pb-4 flex justify-between items-center">
                    <h2 className={`text-2xl font-bold ${text}`}>Notifiche</h2>
                    <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full bg-zinc-800 text-white"><X size={20} /></button>
                </div>
                <div className="px-4 mt-4">
                    <div className={`${card} rounded-2xl overflow-hidden`}>
                        <SettingsToggle label="Promemoria Giornaliero" desc="Notifica alle 09:00" active={notifSettings.dailyReminder} onToggle={() => setNotifSettings(p=>({...p,dailyReminder:!p.dailyReminder}))} color={themeColor} isLast={false} isDarkMode={isDarkMode} />
                        <SettingsToggle label="Suoni App" desc="Effetti sonori" active={notifSettings.sound} onToggle={() => setNotifSettings(p=>({...p,sound:!p.sound}))} color={themeColor} isLast={false} isDarkMode={isDarkMode} />
                        <SettingsToggle label="Vibrazione" desc="Feedback aptico" active={notifSettings.vibration} onToggle={() => setNotifSettings(p=>({...p,vibration:!p.vibration}))} color={themeColor} isLast={true} isDarkMode={isDarkMode} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bg} pb-32 transition-colors duration-300`}>

            {/* Edit Modal */}
            {showEdit && (
                <EditProfileModal
                    userProfile={userProfile}
                    userStats={userStats}
                    themeColor={themeColor}
                    onClose={() => setShowEdit(false)}
                    onSave={handleSaveProfile}
                />
            )}

            {/* Header */}
            <div className="pt-14 px-6 pb-2 flex justify-between items-center">
                <h1 className={`text-3xl font-bold ${text}`}>Profilo</h1>
                <button
                    onClick={() => setShowEdit(true)}
                    className={`${accent} text-base font-semibold hover:opacity-70 px-3 py-1 rounded-lg transition-opacity`}
                >
                    Modifica
                </button>
            </div>

            {/* Avatar + Nome */}
            <div className="flex flex-col items-center py-6 px-4">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${themeColor === 'rose' ? 'border-rose-500/40' : 'border-emerald-500/40'} mb-3`}>
                    {userProfile.image ? (
                        <img src={userProfile.image} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                            <User size={40} className={sub} />
                        </div>
                    )}
                </div>
                <h2 className={`text-2xl font-black ${text}`}>{userProfile.name || 'Atleta'}</h2>
                <p className={`text-sm ${sub} mt-0.5`}>{userProfile.goal ? `Obiettivo: ${userProfile.goal}` : ''}</p>
            </div>

            {/* Stats Cards */}
            <div className="px-4 mb-5">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <Flame size={18} fill="currentColor" />, color: 'text-orange-500 bg-orange-500/10', value: userStats.streak, label: 'Streak' },
                        { icon: <Dumbbell size={18} />, color: `${accent} ${themeColor === 'rose' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`, value: userStats.workoutsCompleted, label: 'Workout' },
                        { icon: <Clock size={18} />, color: 'text-blue-400 bg-blue-500/10', value: `${Math.floor(userStats.activeMinutes / 60)}h`, label: 'Ore' },
                    ].map(({ icon, color, value, label }) => (
                        <div key={label} className={`${card} rounded-2xl p-4 flex flex-col items-center gap-1 border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                            <div className={`${color} p-1.5 rounded-full`}>{icon}</div>
                            <span className={`text-lg font-black ${text}`}>{value}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${sub}`}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Massimali */}
            <div className="px-4 mb-5">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${sub} mb-3 pl-1`}>Massimali</h3>
                <div className={`${card} rounded-2xl border ${isDarkMode ? 'border-white/5' : 'border-black/5'} overflow-hidden`}>
                    {[
                        { label: 'Panca Piana', emoji: '🏋️', value: userStats.maxes?.bench },
                        { label: 'Squat', emoji: '🦵', value: userStats.maxes?.squat },
                        { label: 'Stacco da Terra', emoji: '⚡', value: userStats.maxes?.deadlift },
                    ].map(({ label, emoji, value }, i) => (
                        <div key={label} className={`flex items-center px-4 py-3 ${i < 2 ? `border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}` : ''}`}>
                            <span className="text-xl mr-3">{emoji}</span>
                            <span className={`flex-1 text-sm font-medium ${text}`}>{label}</span>
                            <span className={`text-lg font-black ${accent}`}>{value || 0} <span className={`text-xs font-bold ${sub}`}>kg</span></span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="px-4 mb-5">
                <div className={`${card} rounded-3xl p-5 border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex justify-between items-baseline mb-4">
                        <div>
                            <h3 className={`text-base font-bold ${text}`}>Attività</h3>
                            <p className={`text-[10px] ${sub} uppercase tracking-wider`}>Questa Settimana</p>
                        </div>
                        <span className={`text-xs font-bold ${accent} ${themeColor === 'rose' ? 'bg-rose-500/10' : 'bg-emerald-500/10'} px-2 py-1 rounded-lg`}>
                            {Math.floor(weeklyTotalMinutes / 60)}h {weeklyTotalMinutes % 60}m
                        </span>
                    </div>
                    <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#52525b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} dy={8} />
                                <Tooltip cursor={{ fill: isDarkMode ? '#27272a' : '#f4f4f5', radius: 6 }} content={({ active, payload }) => active && payload?.length ? (
                                    <div className={`px-3 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black shadow-lg'}`}>{payload[0].payload.minutes} min</div>
                                ) : null} />
                                <Bar dataKey="minutes" radius={[4,4,4,4]} barSize={24}>
                                    {chartData.map((e, i) => <Cell key={i} fill={e.minutes > 0 ? accentFill : (isDarkMode ? '#27272a' : '#e4e4e7')} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Storico Recente */}
            <div className="px-4 mb-5">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${sub} mb-3 pl-1`}>Storico Recente</h3>
                {recentHistory.length === 0 ? (
                    <div className={`${card} rounded-2xl p-8 text-center border-dashed border ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                        <Calendar size={28} className={`mx-auto mb-2 opacity-20 ${sub}`} />
                        <p className={`text-sm ${sub}`}>Nessun allenamento completato.</p>
                    </div>
                ) : (
                    <div className={`${card} rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                        {recentHistory.slice(0, 5).map((item, i) => (
                            <div key={item.id} className={`flex items-center gap-3 p-3 ${i < Math.min(recentHistory.length, 5) - 1 ? `border-b ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}` : ''}`}>
                                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                    <span className={`text-[9px] font-bold uppercase ${sub}`}>{item.dayName}</span>
                                    <span className={`text-sm font-black ${text}`}>{item.dayNum}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${text}`}>{item.title}</h4>
                                    <p className={`text-[11px] ${sub} flex items-center gap-1.5 mt-0.5`}>
                                        <span className={`font-bold ${accent}`}>{item.category}</span>
                                        <span>·</span>
                                        <span>{Math.round(item.duration / 60)} min</span>
                                    </p>
                                </div>
                                {onDeleteWorkout && (
                                    <button onClick={() => onDeleteWorkout(item.id, item.date)} className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings */}
            <div className="px-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${sub} mb-2 pl-1`}>Impostazioni</h3>
                <div className={`${card} rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <SettingsToggle label="FaceID all'avvio" desc="Maggiore sicurezza account" active={biometricsEnabled} onToggle={handleToggleBiometrics} color={themeColor} isLast={false} isDarkMode={isDarkMode} />
                    <div className={`h-px ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ml-4`} />
                    <MenuItem icon={Bell} label="Notifiche" onClick={() => setShowNotifications(true)} isDarkMode={isDarkMode} />
                    <div className={`h-px ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ml-4`} />
                    <div className={`flex items-center justify-between p-4 cursor-pointer ${card}`} onClick={toggleTheme}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                            </div>
                            <span className={`${text} text-sm font-medium`}>Dark Mode</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isDarkMode ? accentBg : 'bg-zinc-300'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full mt-6 py-3 text-red-500 font-medium text-sm bg-transparent hover:bg-red-500/10 rounded-xl transition-colors mb-4">
                    Esci dall'account
                </button>
            </div>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, onClick, isDarkMode }: any) => (
    <div onClick={onClick} className={`flex items-center justify-between p-4 cursor-pointer active:opacity-70 ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-500/20 text-zinc-400"><Icon size={18} /></div>
            <span className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm font-medium`}>{label}</span>
        </div>
        <ChevronRight size={16} className="text-zinc-500" />
    </div>
);

const SettingsToggle = ({ label, desc, active, onToggle, color, isLast, isDarkMode }: any) => (
    <div className={`flex items-center justify-between p-4 ${!isLast ? '' : ''} ${isDarkMode ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
        <div>
            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'} text-sm`}>{label}</p>
            <p className="text-xs text-zinc-500">{desc}</p>
        </div>
        <button onClick={onToggle} className={`w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${active ? (color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
    </div>
);

export default ProfileScreen;
