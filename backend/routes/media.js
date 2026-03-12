const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/auth');

const JIKAN_BASE  = 'https://api.jikan.moe/v4';
const TVMAZE_BASE = 'https://api.tvmaze.com';
const OMDB_BASE   = 'https://www.omdbapi.com';
const OMDB_KEY    = process.env.OMDB_API_KEY || '';

// ─── Helper ───────────────────────────────────────────────────────────────────
const fetchData = async (url, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeout);
      if (res.status === 429) {
        // Rate limited — wait and retry
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500));
    }
  }
};

// ─── Normalizers ──────────────────────────────────────────────────────────────
const normalizeTVMaze = (show, mediaType = 'tv') => ({
  id: String(show.id),
  title: show.name,
  media_type: mediaType,
  image: show.image?.original || show.image?.medium || null,
  vote_average: show.rating?.average || null,
  release_date: show.premiered || null,
  first_air_date: show.premiered || null,
  number_of_episodes: show.runtime || null,
  genres: (show.genres || []).join(', '),
  showType: show.type || 'Scripted',
});

const normalizeOMDB = (item) => ({
  id: item.imdbID || String(Math.random()),
  title: item.Title || '',
  media_type: 'movie',
  image: item.Poster && item.Poster !== 'N/A' ? item.Poster : null,
  vote_average: item.imdbRating && item.imdbRating !== 'N/A' ? parseFloat(item.imdbRating) : null,
  release_date: item.Year || null,
  first_air_date: null,
  genres: item.Genre || '',
  showType: 'Movie',
});

// ─── ANIME ────────────────────────────────────────────────────────────────────
router.get('/anime/top', authMiddleware, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchData(`${JIKAN_BASE}/top/anime?page=${page}&limit=25`);
    res.json({ success: true, data: data.data, pagination: data.pagination });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch anime' });
  }
});

router.get('/anime/season', authMiddleware, async (req, res) => {
  try {
    const data = await fetchData(`${JIKAN_BASE}/seasons/now?limit=25`);
    res.json({ success: true, data: data.data });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch seasonal anime' });
  }
});

// ─── TV SHOWS ─────────────────────────────────────────────────────────────────
router.get('/tv/popular', authMiddleware, async (req, res) => {
  try {
    const offset   = Number(req.query.offset) || 0;
    const limit    = Number(req.query.limit)  || 60;
    const pageNums = Array.from({ length: 6 }, (_, i) => offset + i);
    const pages = await Promise.allSettled(
      pageNums.map(p => fetchData(`${TVMAZE_BASE}/shows?page=${p}`))
    );
    const raw = pages.filter(r => r.status === 'fulfilled').flatMap(r => r.value || []);
    const combined = raw
      .filter(s => s.image)
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .slice(0, limit)
      .map(s => normalizeTVMaze(s, 'tv'));
    res.json({ success: true, data: combined, nextOffset: offset + 6 });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch TV shows' });
  }
});

// ─── MOVIES ───────────────────────────────────────────────────────────────────
// Uses OMDb if key is set, otherwise falls back to TVMaze movie-type entries
// so the dashboard always shows something without any setup.

const POPULAR_TERMS = [
  'avengers', 'batman', 'star wars', 'inception', 'interstellar',
  'the dark knight', 'spider-man', 'iron man', 'matrix', 'titanic',
  'jurassic', 'harry potter', 'lord of the rings', 'fast furious', 'mission impossible'
];

router.get('/movies/popular', authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    // ── OMDb path (if key configured) ────────────────────────────────────────
    if (OMDB_KEY) {
      const startIdx = ((page - 1) * 2) % POPULAR_TERMS.length;
      const terms = [
        POPULAR_TERMS[startIdx % POPULAR_TERMS.length],
        POPULAR_TERMS[(startIdx + 1) % POPULAR_TERMS.length],
      ];
      const results = await Promise.allSettled(
        terms.map(t => fetchData(`${OMDB_BASE}/?apikey=${OMDB_KEY}&s=${encodeURIComponent(t)}&type=movie`))
      );
      const seen = new Set();
      const movies = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value?.Search || [])
        .map(normalizeOMDB)
        .filter(m => {
          if (!m.title || !m.image) return false;
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
      return res.json({ success: true, data: movies, nextPage: page + 1 });
    }

    // ── TVMaze fallback (no key needed) ───────────────────────────────────────
    // Fetch 10 pages in parallel to get enough movie-type entries
    const offset   = (page - 1) * 10;
    const pageNums = Array.from({ length: 10 }, (_, i) => offset + i);
    const pages = await Promise.allSettled(
      pageNums.map(p => fetchData(`${TVMAZE_BASE}/shows?page=${p}`))
    );
    const raw = pages.filter(r => r.status === 'fulfilled').flatMap(r => r.value || []);

    // First pass: actual Movie type entries
    const strictMovies = raw
      .filter(s => s.image && s.type === 'Movie')
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .map(s => normalizeTVMaze(s, 'movie'));

    // Second pass: high-rated Scripted/Animation/Documentary as filler
    const seen = new Set(strictMovies.map(m => m.id));
    const filler = raw
      .filter(s => s.image && !seen.has(String(s.id)) &&
        ['Scripted', 'Animation', 'Documentary'].includes(s.type) &&
        (s.rating?.average || 0) >= 7.5)
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .map(s => normalizeTVMaze(s, 'movie'));

    const combined = [...strictMovies, ...filler].slice(0, 60);
    res.json({ success: true, data: combined, nextPage: page + 1 });
  } catch (err) {
    console.error('Movies error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch movies' });
  }
});

// ─── SEARCH ───────────────────────────────────────────────────────────────────
router.get('/search/multi', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });

    const enc = encodeURIComponent(q);

    const promises = [
      fetchData(`${JIKAN_BASE}/anime?q=${enc}&limit=12`),
      fetchData(`${TVMAZE_BASE}/search/shows?q=${enc}`),
    ];

    // Only search movies if OMDb key is set
    if (OMDB_KEY) {
      promises.push(fetchData(`${OMDB_BASE}/?apikey=${OMDB_KEY}&s=${enc}&type=movie`));
    }

    const [animeRes, tvRes, movieRes] = await Promise.allSettled(promises);

    const anime = animeRes.status === 'fulfilled'
      ? (animeRes.value?.data || []) : [];

    const tvmaze = tvRes.status === 'fulfilled'
      ? (tvRes.value || []).map(r => normalizeTVMaze(r.show, 'tv')) : [];

    const movies = (movieRes && movieRes.status === 'fulfilled')
      ? (movieRes.value?.Search || []).map(normalizeOMDB).filter(m => m.title && m.image)
      : [];

    res.json({ success: true, data: { anime, tvmaze, movies } });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;
