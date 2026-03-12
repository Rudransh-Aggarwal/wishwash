import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = ['Home', 'Anime', 'Movies', 'TV Shows'];

export default function Navbar({ onSearch, activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [searchVal, setSearchVal]       = useState('');
  const [focused,   setFocused]         = useState(false);
  const [showMenu,  setShowMenu]        = useState(false);
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/auth'); };
  const handleLogoClick = () => { navigate('/dashboard'); window.location.reload(); };
  const handleSearch = (e) => { e.preventDefault(); if (onSearch && searchVal.trim()) onSearch(searchVal.trim()); };

  return (
    <nav style={{
      background: 'rgba(253,240,245,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(200,120,160,0.15)',
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 32px',
      boxShadow: '0 2px 20px rgba(200,60,100,0.07)',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        height: 64, gap: 8,
      }}>
        {/* Logo */}
        <div onClick={handleLogoClick} style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 22, fontWeight: 900,
          whiteSpace: 'nowrap', letterSpacing: '-0.5px',
          cursor: 'pointer', userSelect: 'none', marginRight: 12,
        }}>
          <span style={{ background: 'linear-gradient(135deg,#ff3d6b,#ff6b35)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Wish</span>
          <span style={{ color: '#2d1b2e' }}>Wash</span>
        </div>

        {/* Links + Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/watchlist" style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 14,
            fontWeight: location.pathname === '/watchlist' ? 600 : 400,
            color: location.pathname === '/watchlist' ? '#ff3d6b' : '#9080a0',
            background: location.pathname === '/watchlist' ? 'rgba(255,61,107,0.08)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>Watchlist</Link>

          {isDashboard && <div style={{ width: 1, height: 18, background: 'rgba(200,120,160,0.25)', margin: '0 4px' }} />}

          {isDashboard && TABS.map(tab => (
            <button key={tab} onClick={() => onTabChange && onTabChange(tab)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 14,
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#ff3d6b' : '#9080a0',
              background: activeTab === tab ? 'rgba(255,61,107,0.1)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: activeTab === tab ? '0 2px 10px rgba(255,61,107,0.15)' : 'none',
            }}>{tab}</button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{
          flex: 1, maxWidth: 360, marginLeft: 'auto',
          display: 'flex', alignItems: 'center',
          background: focused ? '#fff' : 'rgba(255,255,255,0.7)',
          border: `1.5px solid ${focused ? '#ff6b8a' : 'rgba(200,120,160,0.2)'}`,
          borderRadius: 24, overflow: 'hidden', transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 4px rgba(255,107,138,0.1)' : '0 2px 8px rgba(200,60,100,0.06)',
        }}>
          <span style={{ padding: '0 12px', color: '#c090b0', fontSize: 14, flexShrink: 0 }}>🔍</span>
          <input
            style={{
              flex: 1, padding: '9px 0',
              background: 'transparent', border: 'none',
              color: '#2d1b2e', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
            placeholder={`Search${activeTab && activeTab !== 'Home' ? ` ${activeTab}` : ' everything'}...`}
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {searchVal && (
            <button type="submit" style={{
              padding: '6px 14px', margin: 4,
              background: 'linear-gradient(135deg,#ff6b8a,#ff3d6b)',
              border: 'none', borderRadius: 18,
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Oxanium', sans-serif",
            }}>Go</button>
          )}
        </form>

        {/* User avatar */}
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <div onClick={() => setShowMenu(m => !m)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', padding: '5px 10px',
            borderRadius: 24, transition: 'background 0.2s',
            background: showMenu ? 'rgba(255,61,107,0.08)' : 'transparent',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#ff6b8a,#b388f0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 14,
              color: '#fff', flexShrink: 0,
              boxShadow: '0 2px 12px rgba(255,61,107,0.25)',
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2d1b2e' }}>{user?.username}</span>
            <span style={{ color: '#c090b0', fontSize: 11 }}>▾</span>
          </div>

          {showMenu && (
            <div onClick={() => setShowMenu(false)} style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1.5px solid rgba(200,120,160,0.2)',
              borderRadius: 16, padding: 8,
              minWidth: 190, zIndex: 200,
              boxShadow: '0 12px 40px rgba(200,60,100,0.15)',
            }}>
              <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid rgba(200,120,160,0.12)', marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2d1b2e' }}>{user?.username}</div>
                <div style={{ fontSize: 12, color: '#b090b0', marginTop: 2 }}>{user?.email}</div>
              </div>
              <Link to="/watchlist" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', borderRadius: 10,
                fontSize: 14, color: '#6b4c6e', textDecoration: 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,61,107,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >📋 My Watchlist</Link>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 14px', borderRadius: 10,
                border: 'none', background: 'none',
                fontSize: 14, color: '#ff3d6b', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,61,107,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >→ Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
