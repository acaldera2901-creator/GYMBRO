
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: (mode?: string, userId?: string) => void;
}

// ─── Design tokens (inlined per componente, no file CSS extra) ────────────────
const T = {
  bg:      '#07070A',
  bg2:     '#0F0F14',
  bg3:     '#16161D',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  lime:    '#C8FF00',
  coral:   '#FF5D3B',
  muted:   '#6B6B80',
  muted2:  '#8E8EA0',
  text:    '#F0F0F5',
  display: "'Bebas Neue', sans-serif",
  body:    "'DM Sans', sans-serif",
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) { setErrorMsg('Inserisci email e password.'); return; }
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
      let msg = error.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) msg = 'Credenziali non valide.';
      else if (msg.includes('User already registered')) msg = 'Utente già registrato.';
      else if (msg.includes('weak_password')) msg = 'Password troppo debole (min. 6 caratteri).';
      setErrorMsg(msg || 'Si è verificato un errore.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.body, color: T.text, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Background hero image */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1534368786749-b63e05c90863?q=90&w=800&auto=format&fit=crop"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(0.5)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${T.bg} 0%, ${T.bg} 20%, rgba(7,7,10,0.5) 60%, transparent 100%)` }} />
      </div>

      {/* Glow orb */}
      <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: `rgba(200,255,0,0.08)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px' }}>

        {/* Wordmark */}
        <div style={{ marginTop: 56, fontFamily: T.display, fontSize: 13, letterSpacing: '0.22em', color: T.lime }}>
          GYMBRO &nbsp;/&nbsp; 2025
        </div>

        {/* Hero text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 32, paddingTop: 64 }}>
          <h1 style={{ fontFamily: T.display, fontSize: 76, lineHeight: 0.88, color: T.text }}>
            FORGIA<br /><span style={{ color: T.lime }}>IL TUO</span><br />DESTINO.
          </h1>
          <p style={{ fontSize: 15, color: T.muted2, lineHeight: 1.5, marginTop: 14, maxWidth: 280 }}>
            Allenati, monitora, competi. La tua evoluzione inizia qui.
          </p>
        </div>

        {/* Auth Card */}
        <div style={{
          background: T.bg2, border: `1px solid ${T.border2}`,
          borderRadius: '28px 28px 0 0', padding: '28px 24px 40px',
          marginLeft: -24, marginRight: -24,
        }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: T.bg3, borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {[{ id: true, label: 'ACCEDI' }, { id: false, label: 'REGISTRATI' }].map(({ id, label }) => (
              <button
                key={label}
                onClick={() => { setIsLoginMode(id); setErrorMsg(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 11, border: 'none',
                  background: isLoginMode === id ? T.bg + 'DD' : 'transparent',
                  color: isLoginMode === id ? T.text : T.muted,
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer',
                  boxShadow: isLoginMode === id ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                  transition: 'all 0.2s', fontFamily: T.body,
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, marginLeft: 2 }}>Email</div>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.muted }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  placeholder="nome@email.com"
                  style={{ width: '100%', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 16px 16px 46px', color: T.text, fontSize: 15, fontWeight: 500, outline: 'none', fontFamily: T.body, boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(200,255,0,0.5)')}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, marginLeft: 2 }}>Password</div>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.muted }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  placeholder="••••••••"
                  style={{ width: '100%', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 46px 16px 46px', color: T.text, fontSize: 15, fontWeight: 500, outline: 'none', fontFamily: T.body, boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(200,255,0,0.5)')}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
                <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <div style={{ background: 'rgba(255,93,59,0.08)', border: '1px solid rgba(255,93,59,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.coral, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleAuth}
              disabled={isLoading}
              style={{
                width: '100%', background: T.lime, color: '#000', border: 'none',
                borderRadius: 14, padding: '17px', fontSize: 14, fontWeight: 800,
                letterSpacing: '0.08em', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 24px rgba(200,255,0,0.25)`,
                opacity: isLoading ? 0.7 : 1, marginTop: 4, fontFamily: T.body,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isLoginMode ? 'ENTRA' : 'REGISTRATI')}
              {!isLoading && <ArrowRight size={20} strokeWidth={3} />}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, color: T.muted, marginTop: 16, lineHeight: 1.6 }}>
            Continuando accetti i Termini di Servizio<br />e la Privacy Policy di GymBro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
