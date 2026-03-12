import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MediaCard({ item, type, onWatchlistChange }) {
  const [hovered, setHovered] = useState(false);
  const [adding,  setAdding]  = useState(false);

  // ── Normalise fields across Jikan / TVMaze / iTunes ──────────────────────
  const isAnime = type === 'anime';
  const isMovie = type === 'movie';

  const title = isAnime
    ? (item.title_english || item.title)
    : (item.title || item.name || 'Untitled');

  // iTunes already sends a full image URL; Jikan uses images.jpg; TVMaze uses image
  const image = isAnime
    ? item.images?.jpg?.large_image_url
    : (item.image || null);               // iTunes & TVMaze both normalise to `image`

  const score    = isAnime ? item.score : item.vote_average;
  const episodes = isAnime
    ? item.episodes
    : (!isMovie ? item.number_of_episodes : null);

  const mediaType = isAnime ? 'anime' : (item.media_type || type);
  const mediaId   = isAnime ? String(item.mal_id) : String(item.id);

  const year = isAnime
    ? item.aired?.prop?.from?.year
    : (item.release_date || item.first_air_date)?.toString().slice(0, 4);

  const isAdult  = isAnime && item.rating?.includes('Rx');
  const typeLabel = isAnime
    ? (item.type || 'TV')
    : isMovie
      ? (item.showType || 'Movie')
      : (item.showType || 'TV');

  // ── Watchlist add ──────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await axios.post('/api/watchlist', {
        mediaId, mediaType, title, image, score, episodes,
        status: 'plan-to-watch'
      });
      toast.success(`Added "${title}" to watchlist!`);
      if (onWatchlistChange) onWatchlistChange();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg === 'Already in watchlist' ? 'Already in your watchlist' : 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const badgeColor = type === 'anime' ? '#ff3d6b' : type === 'movie' ? '#06b6d4' : '#10b981';
  const badgeLabel = type === 'anime' ? 'ANIME'   : type === 'movie' ? 'MOVIE'   : 'TV';

  const s = {
    card: {
      borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
      background: '#fff', transition: 'transform 0.25s, box-shadow 0.25s',
      transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
      boxShadow: hovered
        ? '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,61,107,0.2)'
        : '0 4px 20px rgba(0,0,0,0.3)',
    },
    imgWrap: {
      position: 'relative', aspectRatio: '2/3',
      overflow: 'hidden', background: '#fdf0f5',
    },
    img: {
      width: '100%', height: '100%', objectFit: 'cover',
      transition: 'transform 0.35s',
      transform: hovered ? 'scale(1.06)' : 'scale(1)',
    },
    noImg: {
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(255,245,248,0.92), rgba(252,232,242,0.92))',
      fontSize: 44,
    },
    overlay: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
      opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end', padding: 12,
    },
    addBtn: {
      padding: '8px 12px',
      background: 'linear-gradient(135deg, #ff3d6b, #ff6b35)',
      border: 'none', borderRadius: 8, color: '#fff',
      fontSize: 12, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer',
      fontFamily: "'Oxanium', sans-serif", opacity: adding ? 0.7 : 1,
      letterSpacing: '0.3px',
    },
    typeBadge: {
      position: 'absolute', top: 8, left: 8,
      background: badgeColor, color: '#fff',
      fontSize: 10, fontWeight: 700,
      padding: '3px 7px', borderRadius: 5,
      fontFamily: "'Oxanium', sans-serif", letterSpacing: '0.5px',
    },
    adultBadge: {
      position: 'absolute', top: 8, right: 8,
      background: '#dc2626', color: '#fff',
      fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5,
    },
    scoreWrap: {
      position: 'absolute', bottom: 8, right: 8,
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      padding: '4px 8px', borderRadius: 6,
    },
    scoreText: {
      fontSize: 12, fontWeight: 700, color: '#f59e0b',
      fontFamily: "'Oxanium', sans-serif",
    },
    info: { padding: '10px 12px 14px' },
    titleText: {
      fontSize: 13, fontWeight: 600, color: '#2d1b2e',
      lineHeight: 1.3, marginBottom: 4,
      display: '-webkit-box', WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    meta: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#b090b0' },
    typePill: {
      fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
      color: type === 'anime' ? '#ff3d6b' : type === 'movie' ? '#06b6d4' : '#10b981',
      background: type === 'anime' ? 'rgba(255,61,107,0.12)' : type === 'movie' ? 'rgba(6,182,212,0.12)' : 'rgba(16,185,129,0.12)',
    },
    dot: { width: 3, height: 3, background: '#475569', borderRadius: '50%' },
  };

  return (
    <div
      style={s.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.imgWrap}>
        {image ? (
          <img src={image} alt={title} style={s.img} loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{ ...s.noImg, display: image ? 'none' : 'flex' }}>
          {type === 'anime' ? '🎌' : type === 'movie' ? '🎬' : '📺'}
        </div>

        <div style={s.typeBadge}>{badgeLabel}</div>
        {isAdult && <div style={s.adultBadge}>18+</div>}
        {score && (
          <div style={s.scoreWrap}>
            <span style={{ fontSize: 11 }}>⭐</span>
            <span style={s.scoreText}>{Number(score).toFixed(1)}</span>
          </div>
        )}
        <div style={s.overlay}>
          <button style={s.addBtn} onClick={handleAdd} disabled={adding}>
            {adding ? '...' : '+ Watchlist'}
          </button>
        </div>
      </div>

      <div style={s.info}>
        <div style={s.titleText}>{title}</div>
        <div style={s.meta}>
          <span style={s.typePill}>{typeLabel}</span>
          {year && <><div style={s.dot} /><span>{year}</span></>}
          {episodes && <><div style={s.dot} /><span>{episodes} eps</span></>}
        </div>
      </div>
    </div>
  );
}
