
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (mode?: string, userId?: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !password) {
      setErrorMsg('Inserisci email e password.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        if (!data.session) throw new Error('Sessione non disponibile. Riprova.');
        onLogin(undefined, data.session.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        if (data.session) {
          onLogin(undefined, data.session.user.id);
        } else if (data.user) {
          setErrorMsg('Controlla la tua email per confermare la registrazione, poi accedi.');
          setIsLoginMode(true);
          setIsLoading(false);
          return;
        } else {
          throw new Error('Registrazione fallita. Riprova.');
        }
      }
    } catch (error: any) {
      console.error(error);
      let msg = error.message || '';
      
      // Robust error matching
      if (msg.toLowerCase().includes('invalid login credentials')) msg = 'Credenziali non valide.';
      else if (msg.includes('User already registered')) msg = 'Utente già registrato.';
      else if (msg.includes('weak_password')) msg = 'Password troppo debole.';
      
      setErrorMsg(msg || 'Si è verificato un errore.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-black font-sans text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-16">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md self-start mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">GymBro Final</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tight mb-2">
          Forgia il<br />Tuo Destino.
        </h1>
        <p className="text-slate-300 text-lg font-medium leading-tight max-w-[280px]">
          Allenati, monitora, competi. La tua evoluzione inizia qui.
        </p>

        <div className="flex-1"></div>

        {/* Login Card */}
        <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-6 mb-8 shadow-2xl relative overflow-hidden">
            
            {/* Tabs */}
            <div className="flex mb-8 border-b border-white/10">
                <button 
                    onClick={() => setIsLoginMode(true)}
                    className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all relative ${isLoginMode ? 'text-white' : 'text-slate-500'}`}
                >
                    ACCEDI
                    {isLoginMode && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                </button>
                <button 
                    onClick={() => setIsLoginMode(false)}
                    className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all relative ${!isLoginMode ? 'text-white' : 'text-slate-500'}`}
                >
                    REGISTRATI
                    {!isLoginMode && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-4 bg-[#1c1c1e] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
                            placeholder="nome@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-12 py-4 bg-[#1c1c1e] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 text-slate-500" /> : <Eye className="h-5 w-5 text-slate-500" />}
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={14} /> {errorMsg}
                    </div>
                )}

                <button
                    onClick={handleAuth}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLoginMode ? 'ENTRA' : 'REGISTRATI')} 
                    {!isLoading && <ArrowRight size={20} strokeWidth={3} />}
                </button>


            </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mb-6 px-10 leading-tight">
            Continuando accetti i Termini di Servizio e la Privacy Policy di GymBro.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
