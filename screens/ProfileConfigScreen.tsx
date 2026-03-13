
import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileConfigScreenProps {
  onNext: (data: Partial<UserProfile>) => void;
  onSkip: () => void;
  initialData?: UserProfile;
}

type ConfigStep = 'identity' | 'measures';

const T = {
  bg: '#07070A', bg2: '#0F0F14', bg3: '#16161D',
  border: 'rgba(255,255,255,0.07)', border2: 'rgba(255,255,255,0.12)',
  lime: '#C8FF00', coral: '#FF5D3B',
  muted: '#6B6B80', muted2: '#8E8EA0', text: '#F0F0F5',
  display: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: T.bg3, border: `1px solid ${T.border}`,
  borderRadius: 14, padding: '16px', color: T.text, fontSize: 15,
  fontWeight: 500, outline: 'none', fontFamily: T.body, boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const ProfileConfigScreen: React.FC<ProfileConfigScreenProps> = ({ onNext, initialData }) => {
  const [step, setStep] = useState<ConfigStep>('identity');
  const [gender, setGender] = useState<'Uomo' | 'Donna' | 'Altro'>('Uomo');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.gender) setGender(initialData.gender);
      if (initialData.weight) setWeight(String(initialData.weight));
      if (initialData.height) setHeight(String(initialData.height));
    }
  }, [initialData]);

  const handleNext = async () => {
    setErrors(null);
    if (step === 'identity') {
      if (!name.trim()) { setErrors('Inserisci il tuo nome.'); return; }
      if (!dob) { setErrors('Inserisci la data di nascita.'); return; }
      setStep('measures');
    } else {
      const w = parseFloat(weight), h = parseFloat(height);
      if (!weight || isNaN(w) || w < 30 || w > 300) { setErrors('Inserisci un peso valido (30–300 kg).'); return; }
      if (!height || isNaN(h) || h < 100 || h > 250) { setErrors('Inserisci un\'altezza valida (100–250 cm).'); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('profiles').upsert({ id: session.user.id, name, gender, weight: w, height: h, updated_at: new Date().toISOString() });
      }
      onNext({ name, gender, weight: w, height: h });
    }
  };

  const progress = step === 'identity' ? 50 : 100;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.body, display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => step === 'measures' ? setStep('identity') : undefined}
          style={{
            width: 40, height: 40, borderRadius: 14, background: T.bg2,
            border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: T.text,
            opacity: step === 'identity' ? 0 : 1, pointerEvents: step === 'identity' ? 'none' : 'auto',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          {/* Progress */}
          <div style={{ height: 3, background: T.bg3, borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', background: T.lime, borderRadius: 100, width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted }}>
            {step === 'identity' ? 'STEP 1 DI 2' : 'STEP 2 DI 2'}
          </span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 120px' }}>
        {step === 'identity' ? (
          <>
            <h1 style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.9, color: T.text, marginBottom: 8 }}>
              CHI SEI<span style={{ color: T.lime }}>?</span>
            </h1>
            <p style={{ fontSize: 14, color: T.muted2, marginBottom: 32 }}>Iniziamo dalle basi per conoscerti meglio.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Gender selector */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Genere</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Uomo', 'Donna', 'Altro'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 14, border: `1px solid ${gender === g ? T.lime : T.border}`,
                        background: gender === g ? `rgba(200,255,0,0.1)` : T.bg2,
                        color: gender === g ? T.lime : T.muted2,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.body,
                        transition: 'all 0.2s',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Nome Completo</div>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Il tuo nome"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(200,255,0,0.5)')}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>Data di Nascita</div>
                <input
                  type="date" value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(200,255,0,0.5)')}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.9, color: T.text, marginBottom: 8 }}>
              LE TUE<br /><span style={{ color: T.lime }}>MISURE</span>
            </h1>
            <p style={{ fontSize: 14, color: T.muted2, marginBottom: 32 }}>Serviranno per calibrare il tuo piano ideale.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Weight */}
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Peso Corporeo</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <input
                    type="number" value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="75"
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: T.display, fontSize: 64, color: T.text, width: '120px' }}
                  />
                  <span style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>kg</span>
                </div>
                {/* Increment buttons */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => setWeight(v => String(Math.min(300, parseFloat(v || '75') + 1)))} style={{ width: 32, height: 32, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', fontSize: 18 }}>+</button>
                  <button onClick={() => setWeight(v => String(Math.max(30, parseFloat(v || '75') - 1)))} style={{ width: 32, height: 32, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', fontSize: 18 }}>−</button>
                </div>
              </div>

              {/* Height */}
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>Altezza</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <input
                    type="number" value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="175"
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: T.display, fontSize: 64, color: T.text, width: '120px' }}
                  />
                  <span style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>cm</span>
                </div>
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => setHeight(v => String(Math.min(250, parseFloat(v || '175') + 1)))} style={{ width: 32, height: 32, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', fontSize: 18 }}>+</button>
                  <button onClick={() => setHeight(v => String(Math.max(100, parseFloat(v || '175') - 1)))} style={{ width: 32, height: 32, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', fontSize: 18 }}>−</button>
                </div>
              </div>

              {/* BMI preview */}
              {weight && height && !isNaN(parseFloat(weight)) && !isNaN(parseFloat(height)) && (
                <div style={{ background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: T.muted2 }}>BMI Stimato</span>
                  <span style={{ fontFamily: T.display, fontSize: 22, color: T.lime }}>
                    {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {errors && (
          <div style={{ marginTop: 16, background: 'rgba(255,93,59,0.08)', border: '1px solid rgba(255,93,59,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.coral }}>
            {errors}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 24px 36px', background: `linear-gradient(to top, ${T.bg} 70%, transparent)` }}>
        <button
          onClick={handleNext}
          style={{
            width: '100%', background: T.lime, color: '#000', border: 'none',
            borderRadius: 16, padding: '17px', fontSize: 14, fontWeight: 800,
            letterSpacing: '0.08em', cursor: 'pointer', fontFamily: T.body,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 24px rgba(200,255,0,0.25)',
          }}
        >
          CONTINUA <ArrowRight size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProfileConfigScreen;
