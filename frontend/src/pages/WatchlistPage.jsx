import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || '';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'watching', label: 'Watching' },
  { key: 'on-hold', label: 'On Hold' },
  { key: 'plan-to-watch', label: 'Plan to Watch' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_COLORS = {
  'watching': '#10b981',
  'on-hold': '#f59e0b',
  'plan-to-watch': '#8b5cf6',
  'dropped': '#ef4444',
  'completed': '#06b6d4',
};


// Build the best rating/info URL per media type
const getRatingUrl = (item) => {
  if (item.mediaType === 'movie') {
    // OMDb mediaId is the imdbID (tt1234567)
    if (item.mediaId && item.mediaId.startsWith('tt')) {
      return `https://www.imdb.com/title/${item.mediaId}/`;
    }
    return `https://www.imdb.com/find?q=${encodeURIComponent(item.title)}`;
  }
  if (item.mediaType === 'anime') {
    return `https://myanimelist.net/anime/${item.mediaId}`;
  }
  // TV — TVMaze id, search IMDb
  return `https://www.imdb.com/find?q=${encodeURIComponent(item.title)}&s=tt&ttype=tv`;
};

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [isPublic, setIsPublic] = useState(false);
  const [hoveredImg, setHoveredImg] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/watchlist`);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  useEffect(() => {
    if (activeStatus === 'all') {
      setFiltered(items);
    } else {
      setFiltered(items.filter(i => i.status === activeStatus));
    }
  }, [items, activeStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/watchlist/${id}`, { status: newStatus });
      setItems(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRemove = async (id, title) => {
    try {
      await axios.delete(`${API_BASE}/api/watchlist/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success(`Removed "${title}"`);
    } catch {
      toast.error('Failed to remove');
    }
  };

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' ? items.length : items.filter(i => i.status === tab.key).length;
    return acc;
  }, {});

  const s = {
    page: { minHeight: '100vh', background: '#fdf0f5' },
    content: { maxWidth: 1400, margin: '0 auto', padding: '32px 24px' },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 28, flexWrap: 'wrap', gap: 16,
    },
    titleWrap: { display: 'flex', alignItems: 'center', gap: 12 },
    icon: { fontSize: 28 },
    title: {
      fontFamily: "'Oxanium', sans-serif",
      fontSize: 28, fontWeight: 800, color: '#2d1b2e',
    },
    publicToggle: {
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, color: '#b090b0',
    },
    toggle: {
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      border: 'none', position: 'relative',
      background: isPublic ? '#ff3d6b' : '#1e2235',
      transition: 'background 0.2s',
    },
    toggleThumb: {
      position: 'absolute', top: 2, width: 20, height: 20,
      borderRadius: '50%', background: '#fff',
      left: isPublic ? 22 : 2, transition: 'left 0.2s',
    },
    statusBar: {
      display: 'flex', gap: 4, marginBottom: 28, flexWrap: 'wrap',
    },
    statusTab: (active) => ({
      padding: '8px 16px', borderRadius: 20,
      border: `1px solid ${active ? 'rgba(255,61,107,0.4)' : '#1e2235'}`,
      background: active ? 'rgba(255,61,107,0.1)' : 'transparent',
      color: active ? '#ff3d6b' : '#64748b',
      fontSize: 13, fontWeight: active ? 600 : 400,
      cursor: 'pointer', transition: 'all 0.2s',
      fontFamily: "'DM Sans', sans-serif",
    }),
    badgeCount: (active) => ({
      display: 'inline-block', minWidth: 18, height: 18,
      borderRadius: 9, background: active ? '#ff3d6b' : '#2d1b2e',
      color: '#fff',
      fontSize: 10, fontWeight: 700, textAlign: 'center',
      lineHeight: '18px', marginLeft: 6,
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 20,
    },
    card: {
      background: '#fff', borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(200,120,160,0.15)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    cardImg: { position: 'relative', aspectRatio: '2/3' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    noImg: {
      width: '100%', height: '100%',
      background: '#fff5f8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 40,
    },
    statusDot: (status) => ({
      position: 'absolute', top: 8, left: 8,
      width: 10, height: 10, borderRadius: '50%',
      background: STATUS_COLORS[status] || '#475569',
      border: '2px solid rgba(0,0,0,0.5)',
    }),
    cardBody: { padding: '12px 14px 14px' },
    cardTitle: {
      fontSize: 13, fontWeight: 600, color: '#2d1b2e',
      marginBottom: 8, lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    statusSelect: {
      width: '100%', padding: '6px 10px',
      background: '#fdf0f5', border: '1px solid rgba(200,120,160,0.15)',
      borderRadius: 7, color: '#9080a0', fontSize: 12,
      cursor: 'pointer', marginBottom: 8,
      fontFamily: "'DM Sans', sans-serif",
    },
    removeBtn: {
      width: '100%', padding: '6px',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 7, color: '#f87171',
      fontSize: 12, cursor: 'pointer',
      transition: 'all 0.15s',
      fontFamily: "'DM Sans', sans-serif",
    },
    empty: {
      textAlign: 'center', padding: '80px 20px', color: '#b090b0',
    },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyText: { fontSize: 16, marginBottom: 8, color: '#b090b0' },
    emptyHint: { fontSize: 13 },
    loadingWrap: {
      display: 'flex', justifyContent: 'center', padding: 60,
    },
    spinner: {
      width: 40, height: 40,
      border: '3px solid #1e2235', borderTop: '3px solid #ff3d6b',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    typePill: (type) => ({
      display: 'inline-block',
      fontSize: 10, fontWeight: 700,
      padding: '2px 6px', borderRadius: 4,
      color: type === 'anime' ? '#ff3d6b' : type === 'movie' ? '#06b6d4' : '#10b981',
      background: type === 'anime' ? 'rgba(255,61,107,0.12)' : type === 'movie' ? 'rgba(6,182,212,0.12)' : 'rgba(16,185,129,0.12)',
      marginBottom: 6,
    }),
  };

  return (
    <div style={s.page}>
      <div className="gif-bg" style={{ backgroundImage: "url(/bg.gif)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
      <div className="gif-overlay" />
      <div className="page-content" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={s.content}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.titleWrap}>
            <span style={s.icon}>❤️</span>
            <h1 style={s.title}>Watch List</h1>
          </div>
          <div style={s.publicToggle}>
            <span>Public</span>
            <button style={s.toggle} onClick={() => setIsPublic(p => !p)}>
              <div style={s.toggleThumb} />
            </button>
            <span style={{ color: isPublic ? '#ff3d6b' : '#475569', fontWeight: 600 }}>
              {isPublic ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Status Tabs */}
        <div style={s.statusBar}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              style={s.statusTab(activeStatus === tab.key)}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
              <span style={s.badgeCount(activeStatus === tab.key)}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={s.loadingWrap}><div style={s.spinner} /></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              {activeStatus === 'all' ? '📭' : '🔍'}
            </div>
            <div style={s.emptyText}>
              {activeStatus === 'all' ? 'Your watchlist is empty' : `No "${STATUS_TABS.find(t=>t.key===activeStatus)?.label}" items`}
            </div>
            <div style={s.emptyHint}>
              {activeStatus === 'all' ? 'Browse the dashboard and add titles!' : 'Change the filter above to see other items.'}
            </div>
          </div>
        ) : (
          <div className="watchlist-grid" style={s.grid}>
            {filtered.map((item, i) => (
              <div key={item._id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div
                  style={s.card}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,61,107,0.25)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1e2235';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{ ...s.cardImg, cursor: 'pointer', position: 'relative' }}
                    onMouseEnter={() => setHoveredImg(item._id)}
                    onMouseLeave={() => setHoveredImg(null)}
                    onClick={() => window.open(getRatingUrl(item), '_blank', 'noopener')}
                  >
                    {item.image ? (
                      <img
                        src={item.image} alt={item.title} style={{
                          ...s.img,
                          filter: hoveredImg === item._id ? 'blur(3px) brightness(0.4)' : 'none',
                          transition: 'filter 0.25s ease',
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={s.noImg}>
                        {item.mediaType === 'anime' ? '🎌' : item.mediaType === 'movie' ? '🎬' : '📺'}
                      </div>
                    )}
                    <div style={s.statusDot(item.status)} />

                    {/* Hover overlay */}
                    {hoveredImg === item._id && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 8, pointerEvents: 'none',
                      }}>
                        <span style={{ fontSize: 28 }}>⭐</span>
                        <span style={{
                          fontFamily: "'Oxanium', sans-serif",
                          fontSize: 14, fontWeight: 700,
                          color: '#fff', letterSpacing: '0.5px',
                        }}>Rate this?</span>
                        <span style={{
                          fontSize: 11, color: 'rgba(255,255,255,0.5)',
                        }}>
                          {item.mediaType === 'anime' ? 'MyAnimeList' : 'IMDb'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={s.cardBody}>
                    <div style={s.typePill(item.mediaType)}>{item.mediaType.toUpperCase()}</div>
                    <div style={s.cardTitle}>{item.title}</div>
                    <select
                      style={s.statusSelect}
                      value={item.status}
                      onChange={e => handleStatusChange(item._id, e.target.value)}
                    >
                      <option value="watching">👁 Watching</option>
                      <option value="on-hold">⏸ On Hold</option>
                      <option value="plan-to-watch">📌 Plan to Watch</option>
                      <option value="dropped">🗑 Dropped</option>
                      <option value="completed">✅ Completed</option>
                    </select>
                    <button
                      style={s.removeBtn}
                      onClick={() => handleRemove(item._id, item.title)}
                      onMouseEnter={e => {
                        e.target.style.background = 'rgba(239,68,68,0.18)';
                        e.target.style.color = '#ef4444';
                      }}
                      onMouseLeave={e => {
                        e.target.style.background = 'rgba(239,68,68,0.08)';
                        e.target.style.color = '#f87171';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
