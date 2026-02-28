import { createClient } from '@supabase/supabase-js';
import { UserStats, WorkoutCard, UserProfile, Badge, Post, Comment } from '../types';

const SUPABASE_URL = 'https://sxjswqsonbkbxcvrbmnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anN3cXNvbmJrYnhjdnJibW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzI4MDIsImV4cCI6MjA4NzgwODgwMn0.KoyckZvphg7Af4mpRvT_bwTjZiFNQH_w3phq9hmk8bI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

// --- HELPER: Sessione valida con auto-refresh ---
const getValidSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const expiresAt = session.expires_at || 0;
    const nowSecs = Math.floor(Date.now() / 1000);
    if (expiresAt - nowSecs < 60) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        return refreshed.session;
    }
    return session;
};

// --- GUEST LOCAL STORAGE ---
const GUEST_STORAGE_KEY = 'gymbro_guest_data';
const getGuestData = () => { try { const d = localStorage.getItem(GUEST_STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } };
const saveGuestData = (data: any) => {
    try {
        const current = getGuestData() || {};
        const merged = { ...current, ...data, profile: { ...(current.profile || {}), ...(data.profile || {}) } };
        try { localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(merged)); }
        catch { if (merged.profile?.image) { merged.profile.image = null; localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(merged)); } }
    } catch (e) { console.error('LS Save Error', e); }
};

// --- 1. FETCH DATI UTENTE ---
export const fetchUserData = async (userId: string) => {
    if (userId.startsWith('guest_')) {
        const localData = getGuestData();
        if (localData?.profile) return { profile: localData.profile, history: localData.history || [], schedules: [] };
        return null;
    }
    try {
        const [profileRes, historyRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('workout_history').select('*').eq('user_id', userId).order('date', { ascending: false })
        ]);
        if (profileRes.error) { if (profileRes.error.code === 'PGRST116') return null; throw new Error(profileRes.error.message); }
        if (historyRes.error) throw new Error(historyRes.error.message);
        return { profile: profileRes.data, history: historyRes.data || [], schedules: [] };
    } catch (e: any) { console.error('[Supabase] Fetch Error:', e.message); throw e; }
};

// --- 2. GUEST PROFILE UPDATE ---
export const updateGuestProfile = async (profileData: any) => { saveGuestData({ profile: profileData }); };

// --- 3. SALVATAGGIO COMPLETO PROFILO (fine setup) ---
export const saveFullProfile = async (userId: string, profile: any) => {
    if (userId.startsWith('guest_')) {
        saveGuestData({ profile: { ...profile, setup_completed: true, training_days: profile.trainingDays, favorite_exercises: profile.favoriteExercises, current_plan: profile.currentPlan, test_exercise: profile.testExercise, test_weight: profile.testWeight, test_reps: profile.testReps } });
        return;
    }
    const session = await getValidSession();
    if (!session) throw new Error('Sessione scaduta. Effettua di nuovo il login.');
    const { error } = await supabase.from('profiles').update({
        name: profile.name, gender: profile.gender, weight: profile.weight, height: profile.height,
        goal: profile.goal, test_exercise: profile.testExercise, test_weight: profile.testWeight, test_reps: profile.testReps,
        image: profile.image, training_days: profile.trainingDays, favorite_exercises: profile.favoriteExercises,
        current_plan: profile.currentPlan, setup_completed: true, updated_at: new Date().toISOString()
    }).eq('id', userId);
    if (error) throw new Error(`Profile save failed: ${error.message}`);
};

// --- 4. AGGIORNAMENTO PARZIALE PROFILO ---
export const updateProfileField = async (userId: string, fields: Record<string, any>) => {
    if (userId.startsWith('guest_')) { saveGuestData({ profile: fields }); return; }
    const session = await getValidSession();
    if (!session) return;
    await supabase.from('profiles').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', userId);
};

// --- 5. COMPLETAMENTO WORKOUT ---
export const completeWorkoutTransaction = async (userId: string, workout: WorkoutCard, duration: number, newBadges: Badge[]) => {
    const today = new Date().toISOString().split('T')[0];
    const historyData = { ...workout, isCompleted: true, completedDuration: duration, completedAt: new Date().toISOString() };

    if (userId.startsWith('guest_')) {
        const current = getGuestData() || {};
        const newItem = { id: `hist_${Date.now()}`, user_id: userId, date: today, workout_data: historyData, duration };
        saveGuestData({ history: [newItem, ...(current.history || [])], profile: { ...(current.profile || {}), badges: newBadges } });
        return newItem;
    }

    const session = await getValidSession();
    if (!session) throw new Error('Sessione scaduta. Effettua di nuovo il login per salvare i progressi.');

    const { data: historyEntry, error: historyError } = await supabase
        .from('workout_history').insert({ user_id: userId, date: today, workout_data: historyData, duration }).select().single();
    if (historyError) throw new Error(`Save failed: ${historyError.message}`);

    // Badge update non-bloccante
    supabase.from('profiles').update({ badges: newBadges, updated_at: new Date().toISOString() }).eq('id', userId)
        .then(({ error }) => { if (error) console.warn('Badge update failed:', error.message); });

    return historyEntry;
};

// --- 6. ANNULLAMENTO WORKOUT ---
export const revertWorkoutTransaction = async (userId: string, historyId: string) => {
    if (userId.startsWith('guest_')) {
        const current = getGuestData() || {};
        const targetId = historyId.replace('db_', '');
        saveGuestData({ history: (current.history || []).filter((h: any) => h.id !== historyId && h.id !== targetId) });
        return true;
    }
    const session = await getValidSession();
    if (!session) throw new Error('Sessione scaduta.');
    const { error } = await supabase.from('workout_history').delete().eq('id', historyId.replace('db_', ''));
    if (error) throw new Error(`Delete failed: ${error.message}`);
    return true;
};

// --- 7. UPDATE STATS ---
export const updateUserStats = async (userId: string, stats: Partial<UserStats>) => {
    if (userId.startsWith('guest_')) { saveGuestData({ profile: { weight: stats.weight, height: stats.height, challenges_won: stats.challengesWon, kg_lifted: stats.kgLifted, maxes: stats.maxes } }); return; }
    const session = await getValidSession();
    if (!session) return;
    await supabase.from('profiles').update({ weight: stats.weight, height: stats.height, challenges_won: stats.challengesWon, kg_lifted: stats.kgLifted, maxes: stats.maxes, updated_at: new Date().toISOString() }).eq('id', userId);
};

// --- 8. COMMUNITY: FETCH POSTS ---
export const fetchCommunityPosts = async (): Promise<Post[]> => {
    try {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        return (data || []).map((p: any) => ({
            id: p.id, userId: p.user_id, user: p.user_name, userImage: p.user_image,
            time: formatRelativeTime(p.created_at), content: p.content, image: p.image, tag: p.tag,
            likes: p.likes || 0, comments: p.comments_count || 0, commentsList: [], liked: false,
            activeChallengeId: p.active_challenge_id, challengeResult: p.challenge_result
        }));
    } catch (e: any) { console.error('[Community] Fetch failed:', e.message); return []; }
};

// --- 9. COMMUNITY: CREA POST ---
export const createPost = async (userId: string, postData: { user: string; userImage?: string; content: string; image?: string | null; tag?: string }): Promise<Post | null> => {
    if (userId.startsWith('guest_')) {
        return { id: `local_${Date.now()}`, userId, user: postData.user, userImage: postData.userImage, time: 'Adesso', content: postData.content, image: postData.image || undefined, tag: postData.tag, likes: 0, comments: 0, commentsList: [], liked: false };
    }
    const session = await getValidSession();
    if (!session) return null;
    const { data, error } = await supabase.from('posts').insert({ user_id: userId, user_name: postData.user, user_image: postData.userImage, content: postData.content, image: postData.image, tag: postData.tag }).select().single();
    if (error) { console.error('[Community] Post failed:', error.message); return null; }
    return { id: data.id, userId: data.user_id, user: data.user_name, userImage: data.user_image, time: 'Adesso', content: data.content, image: data.image, tag: data.tag, likes: 0, comments: 0, commentsList: [], liked: false };
};

// --- 10. COMMUNITY: LIKE ---
export const toggleLikePost = async (postId: string, currentLikes: number, liked: boolean): Promise<number> => {
    const newLikes = liked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    supabase.from('posts').update({ likes: newLikes }).eq('id', postId).then(() => {});
    return newLikes;
};

// --- HELPER: Tempo relativo ---
const formatRelativeTime = (isoString: string): string => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Adesso';
    if (mins < 60) return `${mins}m fa`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h fa`;
    return `${Math.floor(hours / 24)}g fa`;
};

// --- Legacy aliases ---
export const addWorkoutToHistory = async () => { console.warn('Use completeWorkoutTransaction instead'); };
export const removeWorkoutFromHistory = async () => { console.warn('Use revertWorkoutTransaction instead'); };
export const undoWorkoutCompletion = async () => { console.warn('Use revertWorkoutTransaction instead'); };