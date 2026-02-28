
import { createClient } from '@supabase/supabase-js';
import { UserStats, WorkoutCard, UserProfile, Badge } from '../types';

// Cerca queste due righe e sostituiscile con:
const SUPABASE_URL = 'https://sxjswqsonbkbxcvrbmnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4anN3cXNvbmJrYnhjdnJibW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzI4MDIsImV4cCI6MjA4NzgwODgwMn0.KoyckZvphg7Af4mpRvT_bwTjZiFNQH_w3phq9hmk8bI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LOCAL STORAGE HELPERS FOR GUEST ---
const GUEST_STORAGE_KEY = 'gymbro_guest_data';

const getGuestData = () => {
    try {
        const data = localStorage.getItem(GUEST_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) { 
        console.error("LS Read Error", e);
        return null; 
    }
};

const saveGuestData = (data: any) => {
    try {
        const current = getGuestData() || {};
        // Merge profondo per evitare perdita di dati (es. history o arrays)
        const merged = { 
            ...current, 
            ...data,
            profile: { ...(current.profile || {}), ...(data.profile || {}) }
        };
        
        // Safety check per Quota Exceeded (immagini base64 grandi)
        try {
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(merged));
        } catch (quotaError) {
            console.error("LocalStorage Quota Exceeded! Removing images to save text data.");
            // Tenta di salvare senza l'immagine se fallisce
            if (merged.profile && merged.profile.image) {
                merged.profile.image = null; 
                localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(merged));
            }
        }
    } catch (e) { 
        console.error("LS Save Error", e); 
    }
};

// --- 1. CARICAMENTO DATI COMPLETO (SSOT) ---
export const fetchUserData = async (userId: string) => {
    // GUEST HANDLING
    if (userId.startsWith('guest_')) {
        const localData = getGuestData();
        // Se abbiamo dati locali per l'ospite, li usiamo
        if (localData && localData.profile) {
            return {
                profile: localData.profile,
                history: localData.history || [],
                schedules: localData.schedules || [] // Manteniamo compatibilità struttura
            };
        }
        // Altrimenti ritorniamo null per triggerare l'inizializzazione mock
        return null; 
    }

    try {
        // A. Fetch Profilo
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            // Se l'utente non esiste su DB (es. primo login auth), ritorna null pulito
            if (profileError.code === 'PGRST116') return null;
            throw new Error(`Profile fetch error: ${profileError.message}`);
        }

        // B. Fetch Storico Allenamenti
        const { data: history, error: historyError } = await supabase
            .from('workout_history')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (historyError) throw new Error(`History fetch error: ${historyError.message}`);

        // C. Fetch Schedule (Opzionale, usiamo principalmente la rigenerazione dinamica in App.tsx)
        const { data: schedules, error: scheduleError } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', userId);

        return {
            profile: profile,
            history: history || [],
            schedules: schedules || []
        };
    } catch (e: any) {
        console.error('[Supabase] Critical Data Load Error:', e.message);
        throw e;
    }
};

// --- GUEST DATA SAVER (Simulates DB Update) ---
export const updateGuestProfile = async (profileData: any) => {
    // Salva immediatamente
    saveGuestData({ profile: profileData });
};

// --- 2. TRANSAZIONE: COMPLETAMENTO WORKOUT ---
export const completeWorkoutTransaction = async (
    userId: string, 
    workout: WorkoutCard, 
    duration: number, 
    newBadges: Badge[]
) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Oggetto JSON loggato nello storico
    const historyData = {
        ...workout,
        isCompleted: true,
        completedDuration: duration,
        completedAt: new Date().toISOString()
    };

    // GUEST HANDLING
    if (userId.startsWith('guest_')) {
        const current = getGuestData() || {};
        const newHistoryItem = {
            id: `hist_${Date.now()}`,
            user_id: userId,
            date: today,
            workout_data: historyData,
            duration: duration
        };
        const updatedHistory = [newHistoryItem, ...(current.history || [])];
        
        // Aggiorna profilo con badge
        const updatedProfile = { ...(current.profile || {}), badges: newBadges };
        
        saveGuestData({ 
            history: updatedHistory, 
            profile: updatedProfile 
        });
        
        return newHistoryItem;
    }

    try {
        // STEP 1: Inserimento in workout_history
        const { data: historyEntry, error: historyError } = await supabase
            .from('workout_history')
            .insert({
                user_id: userId,
                date: today,
                workout_data: historyData,
                duration: duration
            })
            .select()
            .single();

        if (historyError) throw new Error(`History Insert Failed: ${historyError.message}`);

        // STEP 2: Aggiornamento Profilo (Solo Badges, update timestamp)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                badges: newBadges,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) throw new Error(`Profile Update Failed: ${profileError.message}`);

        return historyEntry;
    } catch (e: any) {
        console.error('[Supabase] Transaction Failed:', e.message);
        throw e;
    }
};

// --- 3. TRANSAZIONE: ANNULLAMENTO WORKOUT (REVERT) ---
export const revertWorkoutTransaction = async (
    userId: string, 
    historyId: string, 
    originalWorkoutId?: string
) => {
    // GUEST HANDLING
    if (userId.startsWith('guest_')) {
        const current = getGuestData() || {};
        // Filtra via l'item
        const updatedHistory = (current.history || []).filter((h: any) => {
             // Gestisce sia ID DB che ID locali simulati
             const hId = h.id;
             const targetId = historyId.replace('db_', '');
             return hId !== historyId && hId !== targetId;
        });
        saveGuestData({ history: updatedHistory });
        return true;
    }

    const realHistoryId = historyId.replace('db_', '');

    try {
        // STEP 1: Elimina da workout_history
        const { error: delError } = await supabase
            .from('workout_history')
            .delete()
            .eq('id', realHistoryId);

        if (delError) throw new Error(`Delete History Failed: ${delError.message}`);

        return true;
    } catch (e: any) {
        console.error('[Supabase] Revert Failed:', e.message);
        throw e;
    }
};

export const updateUserStats = async (userId: string, stats: UserStats) => {
    if (userId.startsWith('guest_')) {
        updateGuestProfile({
            weight: stats.weight,
            height: stats.height,
            challenges_won: stats.challengesWon
        });
        return;
    }
    await supabase.from('profiles').update({
        weight: stats.weight,
        height: stats.height,
        challenges_won: stats.challengesWon,
        updated_at: new Date().toISOString()
    }).eq('id', userId);
};

export const addWorkoutToHistory = async () => { console.warn("Use completeWorkoutTransaction instead"); }
export const removeWorkoutFromHistory = async () => { console.warn("Use revertWorkoutTransaction instead"); }
export const undoWorkoutCompletion = async () => { console.warn("Use revertWorkoutTransaction instead"); }
