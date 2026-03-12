import React, { useRef, useState } from 'react';
import MediaCard from './MediaCard';

const PAGE_SIZE = 30;

const SkeletonCard = ({ grid }) => (
  <div style={{
    ...(grid ? {} : { flexShrink: 0, width: 170 }),
    borderRadius: 12, overflow: 'hidden', background: '#fff',
  }}>
    <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
    <div style={{ padding: '10px 12px 14px' }}>
      <div className="skeleton" style={{ height: 13, width: '80%', marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 4 }} />
    </div>
  </div>
);

// ── Grid layout ───────────────────────────────────────────────────────────────
function GridView({ title, items, type, loading, error, onWatchlistChange, onLoadMore, loadingMore, hasMore }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const allItems = items || [];
  const visible  = allItems.slice(0, visibleCount);
  const canShowMore = visibleCount < allItems.length || hasMore;

  const handleShowMore = () => {
    const nextVisible = visibleCount + PAGE_SIZE;
    if (nextVisible <= allItems.length) {
      // We have enough loaded locally
      setVisibleCount(nextVisible);
    } else {
      // Need to fetch more from API
      setVisibleCount(nextVisible);
      if (onLoadMore) onLoadMore();
    }
  };

  return (
    <div className="section-wrap" style={{ marginBottom: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 4, height: 24, borderRadius: 2,
          background: 'linear-gradient(to bottom, #ff6b8a, #b388f0)',
          flexShrink: 0,
        }} />
        <h2 style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 22, fontWeight: 700, color: '#2d1b2e',
          letterSpacing: '-0.3px', margin: 0,
        }}>{title}</h2>

      </div>

      {error ? (
        <div style={{
          color: '#f87171', fontSize: 14,
          background: 'rgba(255,200,200,0.2)',
          border: '1.5px solid rgba(255,150,150,0.3)',
          borderRadius: 10, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span>⚠ {error}</span>
          {onLoadMore && (
            <button onClick={onLoadMore} style={{
              padding: '6px 16px', borderRadius: 8,
              background: 'rgba(255,61,107,0.12)',
              border: '1px solid rgba(255,61,107,0.3)',
              color: '#ff3d6b', fontSize: 13, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>Retry</button>
          )}
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 18,
          }}>
            {loading
              ? Array(PAGE_SIZE).fill(null).map((_, i) => <SkeletonCard key={i} grid />)
              : visible.map((item, i) => (
                <div key={item?.mal_id || item?.id || i}
                  className="fade-in"
                  style={{ animationDelay: `${Math.min(i, 20) * 0.03}s` }}
                >
                  <MediaCard item={item} type={type} onWatchlistChange={onWatchlistChange} />
                </div>
              ))
            }
          </div>

          {!loading && canShowMore && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={handleShowMore}
                disabled={loadingMore}
                style={{
                  padding: '12px 40px',
                  background: 'transparent',
                  border: '1px solid rgba(255,61,107,0.35)',
                  borderRadius: 10, color: '#ff3d6b',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: "'Oxanium', sans-serif",
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,61,107,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {loadingMore ? 'Loading...' : `Show More →`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Horizontal scroll row ─────────────────────────────────────────────────────
function RowView({ title, items, type, loading, error, onWatchlistChange }) {
  const rowRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const ArrowBtn = ({ dir, visible }) => (
    <button onClick={() => scroll(dir)} style={{
      position: 'absolute', top: '40%',
      [dir === 'left' ? 'left' : 'right']: -18,
      transform: 'translateY(-50%)',
      width: 38, height: 38, borderRadius: '50%',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid rgba(200,120,160,0.2)',
      color: '#fff', fontSize: 18, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'all 0.2s', zIndex: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#ff3d6b'; e.currentTarget.style.borderColor = '#ff3d6b'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.borderColor = 'rgba(200,120,160,0.2)'; }}
    >
      {dir === 'left' ? '‹' : '›'}
    </button>
  );

  const displayItems = loading ? Array(12).fill(null) : (items || []);

  return (
    <div className="section-wrap" style={{ marginBottom: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 22, fontWeight: 700, color: '#2d1b2e',
            letterSpacing: '-0.3px', margin: 0,
          }}>{title}</h2>

        </div>
        {!loading && displayItems.length > 5 && (
          <span style={{ fontSize: 12, color: '#c0a0c0' }}>scroll →</span>
        )}
      </div>

      {error ? (
        <div style={{
          color: '#f87171', fontSize: 14,
          background: 'rgba(255,200,200,0.2)',
          border: '1.5px solid rgba(255,150,150,0.3)',
          borderRadius: 10, padding: '14px 18px',
        }}>⚠ {error}</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <ArrowBtn dir="left"  visible={canScrollLeft} />
          <ArrowBtn dir="right" visible={!loading && canScrollRight} />
          <div ref={rowRef} onScroll={onScroll} style={{
            display: 'flex', gap: 14,
            overflowX: 'auto', overflowY: 'visible',
            paddingBottom: 12, paddingTop: 4,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {displayItems.map((item, i) => (
              <div key={item?.mal_id || item?.id || i}
                className="fade-in"
                style={{ flexShrink: 0, width: 170, position: 'relative', animationDelay: `${Math.min(i, 10) * 0.04}s` }}
              >
                {!loading && (
                  <div style={{
                    position: 'absolute', bottom: 54, left: -2, zIndex: 5, pointerEvents: 'none',
                    fontFamily: "'Oxanium', sans-serif", fontSize: 42, fontWeight: 900, lineHeight: 1,
                    color: 'transparent', WebkitTextStroke: '2px rgba(200,120,160,0.2)', userSelect: 'none',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}
                {loading ? <SkeletonCard /> : (
                  <MediaCard item={item} type={type} onWatchlistChange={onWatchlistChange} />
                )}
              </div>
            ))}
          </div>
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MediaSection({ title, items, type, loading, error, onWatchlistChange, grid, onLoadMore, loadingMore, hasMore }) {
  if (grid) {
    return <GridView title={title} items={items} type={type} loading={loading} error={error}
      onWatchlistChange={onWatchlistChange} onLoadMore={onLoadMore} loadingMore={loadingMore} hasMore={hasMore} />;
  }
  return <RowView title={title} items={items} type={type} loading={loading} error={error} onWatchlistChange={onWatchlistChange} />;
}
