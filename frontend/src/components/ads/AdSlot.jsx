import React, { useEffect, useState, useRef } from 'react';
import { getAdsByPosition, trackAdImpression, trackAdClick, getImageUrl } from '../../services/adminApi';


const AdSlot = ({ position, className = '', style = {}, index }) => {
  const [ads,     setAds]     = useState([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(position !== 'popup'); // popup starts hidden
  const [closed,  setClosed]  = useState(false);
  const trackedIds = useRef(new Set()); // avoid double-tracking same ad
  const timerRef   = useRef(null);

  // ── fetch ads ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getAdsByPosition(position)
      .then(data => setAds(data || []))
      .catch(() => {});
  }, [position]);

  // ── popup delay ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (position !== 'popup' || !ads.length || closed) return;
    const delay = (ads[0]?.popup_delay ?? 5) * 1000;
    timerRef.current = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timerRef.current);
  }, [ads, position, closed]);

  // ── rotate multiple ads every 8s ──────────────────────────────────────────
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [ads.length]);

  // ── track impression on mount / rotation ─────────────────────────────────
  useEffect(() => {
    const ad = ads[current];
    if (!ad || trackedIds.current.has(ad.id)) return;
    trackedIds.current.add(ad.id);
    trackAdImpression(ad.id);
  }, [ads, current]);

  const handleClick = async (ad) => {
    await trackAdClick(ad.id);
    if (ad.link_url) {
      window.open(ad.link_url, ad.link_target || '_blank', 'noopener,noreferrer');
    }
  };

  const closePopup = () => {
    setVisible(false);
    setClosed(true);
    // Remember close time in localStorage to respect popup_frequency
    const ad = ads[current];
    if (ad) {
      localStorage.setItem(`ad_popup_${ad.id}`, Date.now().toString());
    }
  };

  // ── nothing to show ───────────────────────────────────────────────────────
  if (!ads.length || !visible || closed) return null;

  const ad = ads[current];
  const imageUrl = ad?.image ? getImageUrl(ad.image) : null;
  const hasContent = ad?.type === 'html' || imageUrl;
  if (!ad || !hasContent) return null;

  // ── POPUP ─────────────────────────────────────────────────────────────────
  if (position === 'popup') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={closePopup}
      >
        <div
          className="relative max-w-lg w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-lg font-bold transition-all"
          >
            ×
          </button>
          {ad.type === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
          ) : (
            <img
              src={imageUrl}
              alt={ad.title || 'Advertisement'}
              className="w-full cursor-pointer"
              onClick={() => handleClick(ad)}
              onError={e => e.target.style.display = 'none'}
            />
          )}
        </div>
      </div>
    );
  }

  // ── NAVBAR ────────────────────────────────────────────────────────────────
if (position === 'navbar') {
  return (
    <div 
      className={`flex items-center w-full max-w-[400px] lg:max-w-[800px] h-[80px] sm:h-[100px] lg:h-[130px] overflow-hidden rounded-lg lg:rounded-2xl ${className}`} 
      style={style}
    >
      {ad.type === 'html' ? (
        <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
      ) : (
        <img
          src={imageUrl}
          alt={ad.title || 'Advertisement'}
          className="w-full h-full cursor-pointer object-cover rounded-lg lg:rounded-2xl"
          onClick={() => handleClick(ad)}
          onError={e => e.target.style.display = 'none'}
        />
      )}
    </div>
  );
}

  // ── HERO BANNER ───────────────────────────────────────────────────────────
  if (position === 'hero_banner') {
    return (
      <div className={`w-full overflow-hidden rounded-xl ${className}`} style={style}>
        {ad.type === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
        ) : (
          <img
            src={imageUrl}
            alt={ad.title || 'Advertisement'}
            className="w-full object-cover cursor-pointer"
            style={{ height: ad.height || '200px' }}
            onClick={() => handleClick(ad)}
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </div>
    );
  }

  // ── SIDEBAR ───────────────────────────────────────────────────────────────
  if (position === 'sidebar') {
    return (
      <div className={`w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm ${className}`} style={style}>
        <div className="bg-slate-100 text-slate-400 text-center text-[10px] py-1 font-semibold tracking-widest uppercase">
          Advertisement
        </div>
        {ad.type === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
        ) : (
          <img
            src={imageUrl}
            alt={ad.title || 'Advertisement'}
            className="w-full object-cover cursor-pointer"
            style={{ height: ad.height || '250px' }}
            onClick={() => handleClick(ad)}
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </div>
    );
  }

  // ── IN-FEED ───────────────────────────────────────────────────────────────
  if (position === 'infeed') {
    return (
      <div className={`w-full rounded-xl overflow-hidden border border-slate-100 ${className}`} style={style}>
        <div className="bg-slate-50 text-slate-300 text-center text-[10px] py-0.5 font-semibold tracking-widest uppercase">
          Sponsored
        </div>
        {ad.type === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
        ) : (
          <img
            src={imageUrl}
            alt={ad.title || 'Advertisement'}
            className="w-full object-cover cursor-pointer"
            style={{ height: ad.height || '120px' }}
            onClick={() => handleClick(ad)}
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </div>
    );
  }

  // ── NEWS/BLOG DETAIL (top / middle / bottom) ──────────────────────────────
  return (
    <div className={`w-full my-6 rounded-xl overflow-hidden ${className}`} style={style}>
      <div className="text-center text-[10px] text-slate-300 font-semibold tracking-widest uppercase mb-1">
        Advertisement
      </div>
      {ad.type === 'html' ? (
        <div dangerouslySetInnerHTML={{ __html: ad.html_content }} />
      ) : (
        <img
          src={imageUrl}
          alt={ad.title || 'Advertisement'}
          className="w-full object-cover cursor-pointer rounded-xl"
          style={{ height: ad.height || '120px' }}
          onClick={() => handleClick(ad)}
          onError={e => e.target.style.display = 'none'}
        />
      )}
    </div>
  );
};

export default AdSlot;