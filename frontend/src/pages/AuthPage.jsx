import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode]           = useState('signin');
  const [form, setForm]           = useState({ username: '', email: '', password: '', identifier: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [focused, setFocused]     = useState('');
  const { signup, signin }        = useAuth();
  const navigate                  = useNavigate();

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'signup') {
        if (!form.username || !form.email || !form.password) { setError('All fields are required'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        await signup(form.username, form.email, form.password);
        toast.success(`Welcome to WishWash, ${form.username}! 🎉`);
      } else {
        if (!form.identifier || !form.password) { setError('All fields are required'); setLoading(false); return; }
        await signin(form.identifier, form.password);
        toast.success('Welcome back! 👋');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const inp = (field) => ({
    width: '100%', padding: '13px 16px 13px 44px',
    background: '#fff',
    border: `2px solid ${focused === field ? '#ff6b8a' : '#f0e8f0'}`,
    borderRadius: 14, color: '#2d1b2e',
    fontSize: 15, outline: 'none',
    transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: focused === field ? '0 0 0 4px rgba(255,107,138,0.12)' : 'none',
  });

  // Decorative floating shapes for illustration panel
  const shapes = [
    { size: 80, x: '10%', y: '8%',  color: 'rgba(255,200,200,0.5)', delay: '0s' },
    { size: 50, x: '70%', y: '5%',  color: 'rgba(200,220,255,0.5)', delay: '0.5s' },
    { size: 60, x: '80%', y: '55%', color: 'rgba(255,230,180,0.5)', delay: '1s' },
    { size: 40, x: '5%',  y: '70%', color: 'rgba(180,255,220,0.5)', delay: '1.5s' },
    { size: 90, x: '60%', y: '80%', color: 'rgba(255,200,240,0.4)', delay: '0.8s' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#fdf0f5',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .auth-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* ── LEFT PANEL — Illustration ── */}
      <div style={{
        flex: '0 0 48%', position: 'relative',
        background: 'linear-gradient(160deg, #ffd6e0 0%, #ffb3c6 40%, #ffc8dd 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: 48,
      }}>
        {/* Background blobs */}
        {shapes.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: s.x, top: s.y,
            width: s.size, height: s.size, borderRadius: '50%',
            background: s.color, filter: 'blur(8px)',
            animation: `float 4s ease-in-out ${s.delay} infinite`,
          }} />
        ))}

        {/* Big decorative circle */}
        <div style={{
          position: 'absolute', width: 380, height: 380,
          background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
          top: '50%', left: '50%', transform: 'translate(-50%,-54%)',
        }} />

        {/* Mascot illustration using CSS art */}
        <div className="auth-float" style={{ position: 'relative', zIndex: 2, marginBottom: 32 }}>
          {/* Character body */}
          <div style={{ position: 'relative', width: 220, height: 260 }}>
            {/* Body */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 140, height: 120,
              background: 'linear-gradient(160deg, #b388f0, #9b6de0)',
              borderRadius: '40% 40% 30% 30%',
            }} />
            {/* Head */}
            <div style={{
              position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)',
              width: 120, height: 110,
              background: '#ffb8c6',
              borderRadius: '50% 50% 45% 45%',
              boxShadow: 'inset -8px -10px 20px rgba(200,80,100,0.15)',
            }}>
              {/* Eyes */}
              <div style={{ position: 'absolute', top: 38, left: 24, width: 18, height: 18, background: '#2d1b2e', borderRadius: '50%' }}>
                <div style={{ position: 'absolute', top: 3, right: 4, width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />
              </div>
              <div style={{ position: 'absolute', top: 38, right: 24, width: 18, height: 18, background: '#2d1b2e', borderRadius: '50%' }}>
                <div style={{ position: 'absolute', top: 3, right: 4, width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />
              </div>
              {/* Cheeks */}
              <div style={{ position: 'absolute', top: 52, left: 14, width: 24, height: 14, background: '#ff9eb5', borderRadius: '50%', opacity: 0.7 }} />
              <div style={{ position: 'absolute', top: 52, right: 14, width: 24, height: 14, background: '#ff9eb5', borderRadius: '50%', opacity: 0.7 }} />
              {/* Smile */}
              <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', width: 40, height: 20, borderBottom: '3px solid #c0607a', borderRadius: '0 0 50% 50%' }} />
              {/* Tongue */}
              <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', width: 18, height: 12, background: '#ff6b8a', borderRadius: '0 0 50% 50%' }} />
            </div>
            {/* Helmet/Hat */}
            <div style={{
              position: 'absolute', bottom: 168, left: '50%', transform: 'translateX(-50%)',
              width: 130, height: 55,
              background: 'linear-gradient(135deg, #f0c060, #e8a030)',
              borderRadius: '50% 50% 20% 20%',
            }}>
              {/* Goggles */}
              <div style={{ position: 'absolute', top: 18, left: 16, display: 'flex', gap: 8 }}>
                <div style={{ width: 34, height: 22, background: '#cc3355', borderRadius: 8, border: '3px solid #e8a030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 22, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2, transform: 'rotate(-20deg)' }} />
                </div>
                <div style={{ width: 34, height: 22, background: '#cc3355', borderRadius: 8, border: '3px solid #e8a030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 22, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: 2, transform: 'rotate(-20deg)' }} />
                </div>
              </div>
            </div>
            {/* Hair */}
            <div style={{
              position: 'absolute', bottom: 195, left: 25,
              width: 45, height: 55,
              background: 'linear-gradient(160deg, #60c8e0, #40a8c0)',
              borderRadius: '40% 20% 30% 50%',
              transform: 'rotate(-10deg)',
            }} />
            {/* Waving hand */}
            <div style={{
              position: 'absolute', bottom: 80, right: -20,
              width: 55, height: 55,
              background: '#ffb8c6', borderRadius: '50%',
              boxShadow: 'inset -4px -4px 10px rgba(200,80,100,0.15)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 4,
            }}>
              {/* Fingers */}
              {[0,1,2,3].map(j => (
                <div key={j} style={{ width: 8, height: 16, background: '#ffb8c6', borderRadius: 4, border: '1px solid rgba(200,80,100,0.3)', marginRight: j < 3 ? 2 : 0 }} />
              ))}
            </div>
            {/* Floating paper */}
            <div style={{
              position: 'absolute', top: 10, right: -10,
              width: 56, height: 68,
              background: '#fff', borderRadius: 8,
              boxShadow: '2px 4px 16px rgba(0,0,0,0.12)',
              transform: 'rotate(15deg)',
              padding: 8,
            }}>
              {[0,1,2,3].map(j => (
                <div key={j} style={{ height: 4, background: '#e8dff0', borderRadius: 2, marginBottom: 6 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 28, fontWeight: 900,
            color: '#c0446a', letterSpacing: '-0.5px', marginBottom: 8,
          }}>WishWash</div>
          <div style={{ fontSize: 14, color: '#c07090', lineHeight: 1.6 }}>
            Discover & track your favourite<br />anime, movies & TV shows.
          </div>
        </div>

        {/* Floating pills */}
        {['🎌 Anime', '🎬 Movies', '📺 TV Shows'].map((tag, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: i === 0 ? '5%' : i === 1 ? 'auto' : '8%',
            right: i === 1 ? '5%' : 'auto',
            top: i === 0 ? '12%' : i === 1 ? '18%' : 'auto',
            bottom: i === 2 ? '14%' : 'auto',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 20, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, color: '#c0446a',
            boxShadow: '0 4px 16px rgba(200,60,100,0.15)',
            animation: `float ${3.5 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }}>{tag}</div>
        ))}
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', background: '#fdf0f5',
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.5s ease' }}>
          <h1 style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 34, fontWeight: 900, color: '#2d1b2e',
            marginBottom: 6, letterSpacing: '-0.5px',
          }}>
            {mode === 'signin' ? 'Welcome back 👋' : 'Join WishWash ✨'}
          </h1>
          <p style={{ fontSize: 14, color: '#9080a0', marginBottom: 32 }}>
            {mode === 'signin' ? 'Sign in to your account to continue' : 'Create your free account today'}
          </p>

          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: '#f5e6ef',
            borderRadius: 14, padding: 4, marginBottom: 28, gap: 4,
          }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 11,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#c0446a' : '#b090b0',
                boxShadow: mode === m ? '0 2px 12px rgba(200,60,100,0.15)' : 'none',
              }}>{m === 'signin' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>

          {error && (
            <div style={{
              background: '#fff0f3', border: '1.5px solid #ffb3c6',
              borderRadius: 10, padding: '10px 14px',
              color: '#c0446a', fontSize: 13, marginBottom: 18,
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9080a0', marginBottom: 8 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                  <input name="username" value={form.username} onChange={handleChange}
                    placeholder="your_username" style={inp('username')}
                    onFocus={() => setFocused('username')} onBlur={() => setFocused('')} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9080a0', marginBottom: 8 }}>
                {mode === 'signup' ? 'Email' : 'Username or Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                <input
                  name={mode === 'signup' ? 'email' : 'identifier'}
                  value={mode === 'signup' ? form.email : form.identifier}
                  onChange={handleChange}
                  placeholder={mode === 'signup' ? 'you@email.com' : 'username or email'}
                  style={inp(mode === 'signup' ? 'email' : 'identifier')}
                  onFocus={() => setFocused(mode === 'signup' ? 'email' : 'identifier')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9080a0', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" style={{ ...inp('password'), paddingRight: 48 }}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0,
                }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px',
              background: loading ? '#f0a0b8' : 'linear-gradient(135deg, #ff6b8a, #ff3d6b)',
              border: 'none', borderRadius: 14,
              color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Oxanium', sans-serif", letterSpacing: '0.5px',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(255,61,107,0.35)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Please wait...
                </>
              ) : (
                mode === 'signin' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#b090b0' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} style={{
              background: 'none', border: 'none', color: '#ff3d6b', fontWeight: 700,
              cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}>
              {mode === 'signin' ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
