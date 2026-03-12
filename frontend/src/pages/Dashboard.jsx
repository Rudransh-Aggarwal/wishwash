import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MediaSection from '../components/MediaSection';

const TABS = ['Home', 'Anime', 'Movies', 'TV Shows'];

const SEARCH_FILTERS = [
  { key: 'all',    label: 'All',      icon: '🔍' },
  { key: 'anime',  label: 'Anime',    icon: '🎌' },
  { key: 'movies', label: 'Movies',   icon: '🎬' },
  { key: 'shows',  label: 'TV Shows', icon: '📺' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab]         = useState('Home');
  const [data, setData]                   = useState({ anime: [], movies: [], tv: [], seasonal: [] });
  const [loading, setLoading]             = useState({ anime: true, movies: true, tv: true });
  const [loadingMore, setLoadingMore]     = useState({ anime: false, movies: false, tv: false });
  const [offsets, setOffsets]             = useState({ anime: 2, movies: 2, tv: 0 });
  const [hasMore, setHasMore]             = useState({ anime: true, movies: true, tv: true });
  const [errors, setErrors]               = useState({ anime: null, seasonal: null, movies: null, tv: null });
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchFilter, setSearchFilter]   = useState('all');

  const fetchAnime = useCallback(async () => {
    // Fetch top and seasonal independently so one failure doesn't block the other
    const [topRes, seasonalRes] = await Promise.allSettled([
      axios.get('/api/media/anime/top'),
      axios.get('/api/media/anime/season'),
    ]);

    if (topRes.status === 'fulfilled') {
      setData(d => ({ ...d, anime: topRes.value.data.data || [] }));
    } else {
      setErrors(e => ({ ...e, anime: 'Failed to load anime. Try refreshing.' }));
    }

    if (seasonalRes.status === 'fulfilled') {
      setData(d => ({ ...d, seasonal: seasonalRes.value.data.data || [] }));
    }

    setLoading(l => ({ ...l, anime: false }));
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      const res = await axios.get('/api/media/movies/popular?page=1');
      const movieData = res.data.data || [];
      setData(d => ({ ...d, movies: movieData }));
      setOffsets(o => ({ ...o, movies: 2 }));
      if (movieData.length === 0) setHasMore(h => ({ ...h, movies: false }));
    } catch {
      setErrors(e => ({ ...e, movies: 'Failed to load movies.' }));
    } finally {
      setLoading(l => ({ ...l, movies: false }));
    }
  }, []);

  const fetchTV = useCallback(async () => {
    try {
      const res = await axios.get('/api/media/tv/popular?offset=0&limit=60');
      setData(d => ({ ...d, tv: res.data.data || [] }));
      setOffsets(o => ({ ...o, tv: res.data.nextOffset || 6 }));
    } catch {
      setErrors(e => ({ ...e, tv: 'Failed to load TV shows.' }));
    } finally {
      setLoading(l => ({ ...l, tv: false }));
    }
  }, []);

  useEffect(() => {
    fetchAnime();
    fetchMovies();
    fetchTV();
  }, [fetchAnime, fetchMovies, fetchTV]);

  const loadMore = async (section) => {
    if (loadingMore[section]) return;
    setLoadingMore(l => ({ ...l, [section]: true }));
    try {
      let endpoint;
      if (section === 'anime') {
        endpoint = `/api/media/anime/top?page=${offsets.anime}`;
      } else if (section === 'movies') {
        endpoint = `/api/media/movies/popular?page=${offsets.movies}`;
      } else {
        endpoint = `/api/media/tv/popular?offset=${offsets.tv}&limit=60`;
      }
      const res = await axios.get(endpoint);
      // Anime returns res.data.data, movies/tv also return res.data.data
      const newItems = (section === 'anime' ? res.data.data : res.data.data) || [];
      if (newItems.length === 0) {
        setHasMore(h => ({ ...h, [section]: false }));
      } else {
        setData(d => ({ ...d, [section]: [...d[section], ...newItems] }));
        setOffsets(o => ({ ...o, [section]: (o[section] || 1) + 1 }));
      }
    } catch {}
    finally { setLoadingMore(l => ({ ...l, [section]: false })); }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    setSearchLoading(true);
    setSearchResults(null);
    // Set filter to match current tab so results are scoped automatically
    const tabFilterMap = { 'Anime': 'anime', 'Movies': 'movies', 'TV Shows': 'shows', 'Home': 'all' };
    const scopedFilter = tabFilterMap[activeTab] || 'all';
    setSearchFilter(scopedFilter);
    try {
      const res = await axios.get(`/api/media/search/multi?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data.data);
    } catch {
      setSearchResults({ anime: [], tvmaze: [], movies: [] });
    } finally {
      setSearchLoading(false);
    }
  };

    const clearSearch = () => { setSearchResults(null); setSearchQuery(''); setSearchFilter('all'); };

  // Counts for filter chips
  const countAnime  = searchResults?.anime?.length  || 0;
  const countMovies = searchResults?.movies?.length || 0;
  const countShows  = searchResults?.tvmaze?.length || 0;
  const totalCount  = countAnime + countMovies + countShows;

  const chipCount = (key) => {
    if (key === 'all')    return totalCount;
    if (key === 'anime')  return countAnime;
    if (key === 'movies') return countMovies;
    if (key === 'shows')  return countShows;
    return 0;
  };

  const showSearchAnime  = searchFilter === 'all' || searchFilter === 'anime';
  const showSearchMovies = searchFilter === 'all' || searchFilter === 'movies';
  const showSearchShows  = searchFilter === 'all' || searchFilter === 'shows';

  const s = {
    page: { minHeight: '100vh', background: '#0d0f1a' },
    hero: {
      background: 'linear-gradient(135deg, rgba(255,61,107,0.08) 0%, rgba(139,92,246,0.06) 50%, transparent 100%)',
      borderBottom: '1px solid rgba(255,61,107,0.06)',
      padding: '32px 24px',
    },
    heroInner: { maxWidth: 1400, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 },
    heroTitle: {
      fontFamily: "'Oxanium', sans-serif",
      fontSize: 32, fontWeight: 800, color: '#800000',
      marginBottom: 6, letterSpacing: '-0.5px',
    },
    heroSub: { fontSize: 15, color: '#444', fontWeight: 500 },
    tabs: {
      display: 'flex', gap: 4, padding: '20px 24px 0',
      maxWidth: 1400, margin: '0 auto',
    },
    tab: (active) => ({
      padding: '9px 20px', borderRadius: '8px 8px 0 0',
      border: 'none', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 700 : 500,
      fontFamily: "'Oxanium', sans-serif",
      color: active ? '#ff3d6b' : '#64748b',
      background: active ? 'rgba(255,61,107,0.08)' : 'transparent',
      borderBottom: active ? '2px solid #ff3d6b' : '2px solid transparent',
      transition: 'all 0.2s', letterSpacing: '0.3px',
    }),
    content: { maxWidth: 1400, margin: '0 auto', padding: '32px 24px' },
    searchHeader: {
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(200,120,160,0.2)',
      borderRadius: 14, padding: '16px 20px',
      marginBottom: 28,
    },
    searchTopRow: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 16,
      flexWrap: 'wrap', gap: 10,
    },
    searchTitle: { fontSize: 15, color: '#6b4c6e' },
    clearBtn: {
      background: 'none', border: '1.5px solid rgba(255,61,107,0.3)',
      color: '#ff3d6b', padding: '6px 16px', borderRadius: 20,
      cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.2s',
    },
    filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    filterLabel: {
      fontSize: 11, color: '#475569', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 2,
    },
    filterChip: (active) => ({
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 16px', borderRadius: 20, cursor: 'pointer', border: 'none',
      background: active ? 'rgba(255,61,107,0.12)' : '#141623',
      outline: `1px solid ${active ? '#ff3d6b' : '#1e2235'}`,
      color: active ? '#ff3d6b' : '#64748b',
      fontSize: 13, fontWeight: active ? 700 : 400,
      transition: 'all 0.18s', fontFamily: "'Oxanium', sans-serif",
      boxShadow: active ? '0 0 14px rgba(255,61,107,0.18)' : 'none',
    }),
    chipCount: (active) => ({
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 20, height: 20, borderRadius: 10, fontSize: 10, fontWeight: 700,
      background: active ? '#ff3d6b' : '#1e2235',
      color: active ? '#fff' : '#475569', padding: '0 5px',
    }),
    noResults: {
      textAlign: 'center', padding: '60px 20px',
      color: '#b090b0', fontSize: 15,
    },
    loadMoreWrap: { textAlign: 'center', marginTop: 8, marginBottom: 40 },
    loadMoreBtn: {
      padding: '11px 36px', background: 'transparent',
      border: '1.5px solid rgba(255,61,107,0.35)', borderRadius: 24,
      color: '#ff3d6b', fontSize: 14, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.2s',
      fontFamily: "'Oxanium', sans-serif",
    },
    spinner: {
      width: 34, height: 34, border: '3px solid #ffd6e0',
      borderTop: '3px solid #ff3d6b', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
    },
  };



  return (
    <div style={s.page}>
      <div className="gif-bg" style={{ backgroundImage: "url(/bg.gif)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
      <div className="gif-overlay" />
      <div className="page-content" style={{ minHeight: '100vh' }}>
      <Navbar onSearch={handleSearch} activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSearchResults(null); setSearchQuery(''); }} />

      <div style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>What do you want to watch?</h1>
          <p style={s.heroSub}>Discover top anime, movies & TV shows. Add anything to your personal watchlist.</p>
        </div>
      </div>



      <div style={s.content}>

        {/* ── SEARCH RESULTS ── */}
        {searchResults ? (
          <>
            {/* Header with filter chips */}
            <div style={s.searchHeader}>
              <div style={s.searchTopRow}>
                <span style={s.searchTitle}>
                  {activeTab !== 'All' && (
                    <span style={{ color: '#475569', marginRight: 6 }}>{activeTab} results for</span>
                  )}
                  {activeTab === 'Home' && 'Results for '}
                  <strong style={{ color: '#f1f5f9', fontFamily: "'Oxanium', sans-serif" }}>
                    "{searchQuery}"
                  </strong>
                  {!searchLoading && (
                    <span style={{ color: '#475569', fontSize: 13, marginLeft: 8 }}>
                      — {totalCount} found
                    </span>
                  )}
                </span>
                <button
                  style={s.clearBtn}
                  onClick={clearSearch}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,61,107,0.08)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  ✕ Clear
                </button>
              </div>


            </div>

            {/* Results */}
            {searchLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={s.spinner} />
                Searching across anime, movies & shows...
              </div>
            ) : totalCount === 0 ? (
              <div style={s.noResults}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
                <div style={{ color: '#64748b', marginBottom: 6 }}>No results found for "{searchQuery}"</div>
                <div style={{ fontSize: 13 }}>Try a different search term</div>
              </div>
            ) : (
              <>
{showSearchAnime && countAnime > 0 && (
                  <MediaSection title="🎌 Anime" items={searchResults.anime}
                    type="anime" loading={false} grid />
                )}
                {showSearchMovies && countMovies > 0 && (
                  <MediaSection title="🎬 Movies" items={searchResults.movies}
                    type="movie" loading={false} grid />
                )}
                {showSearchShows && countShows > 0 && (
                  <MediaSection title="📺 TV Shows" items={searchResults.tvmaze}
                    type="tv" loading={false} grid />
                )}
              </>
            )}
          </>
        ) : (

          /* ── BROWSE SECTIONS ── */
          <>
            {/* ALL tab — horizontal scroll rows with numbered cards */}
            {activeTab === 'Home' && (
              <>
                {!loading.anime && data.seasonal.length > 0 && (
                  <MediaSection title="🌸 Currently Airing" items={data.seasonal}
                    type="anime" loading={false} />
                )}
                <MediaSection title="🎬 Top Movies" items={data.movies} type="movie"
                  loading={loading.movies} error={errors.movies} />
                <MediaSection title="📺 Popular TV Shows" items={data.tv} type="tv"
                  loading={loading.tv} error={errors.tv} />
              </>
            )}

            {/* ANIME tab — full grid + show more */}
            {activeTab === 'Anime' && (
              <MediaSection title="🎌 Top Anime" items={data.anime}
                type="anime" loading={loading.anime} error={errors.anime} grid
                onLoadMore={() => loadMore('anime')} loadingMore={loadingMore.anime} hasMore={hasMore.anime} />
            )}

            {/* MOVIES tab — full grid + show more */}
            {activeTab === 'Movies' && (
              <MediaSection title="🎬 Top Movies" items={data.movies} type="movie"
                loading={loading.movies} error={errors.movies} grid
                onLoadMore={() => loadMore('movies')} loadingMore={loadingMore.movies} hasMore={hasMore.movies} />
            )}

            {/* TV SHOWS tab — full grid + show more */}
            {activeTab === 'TV Shows' && (
              <MediaSection title="📺 Popular TV Shows" items={data.tv} type="tv"
                loading={loading.tv} error={errors.tv} grid
                onLoadMore={() => loadMore('tv')} loadingMore={loadingMore.tv} hasMore={hasMore.tv} />
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
