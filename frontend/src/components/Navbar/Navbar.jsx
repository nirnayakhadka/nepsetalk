import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdSlot from '../ads/AdSlot';
import { getCategoriesList, searchNews } from '../../services/adminApi';

const slugify = (text) =>
  text?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') ?? '';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNewsOpen, setIsMobileNewsOpen] = useState(false);
  const [categories, setCategories]             = useState([]);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchResults, setSearchResults]       = useState([]);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
 
  const [showFullNav, setShowFullNav]           = useState(true);
  const [showMiniNav, setShowMiniNav]           = useState(false);
  const [fullNavDropdownOpen, setFullNavDropdownOpen] = useState(false);
  const [miniNavDropdownOpen, setMiniNavDropdownOpen] = useState(false);
  
  const lastScrollY = useRef(0);
  const ticking    = useRef(false);
  const navigate   = useNavigate();

  // ── Load categories (only those with published news) ─────────────────────
  useEffect(() => {
    getCategoriesList()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        // Backend returns news_count for published news only — filter out zeros
        setCategories(list.filter(cat => Number(cat.news_count) > 0));
      })
      .catch(() => setCategories([]));
  }, []);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (!q) { setSearchResults([]); setIsSearchOpen(false); return; }
      try {
        const res  = await searchNews(q);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setSearchResults(list);
        setIsSearchOpen(list.length > 0);
      } catch {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Scroll hide / show ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y    = window.scrollY;
        const diff = y - lastScrollY.current;
        if (y < 80)       { setShowFullNav(true);  setShowMiniNav(false); }
        else if (diff > 6) { setShowFullNav(false); setShowMiniNav(false); }
        else if (diff < -6){ setShowFullNav(false); setShowMiniNav(true);  }
        lastScrollY.current = y;
        ticking.current     = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleResultClick = (id) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchResults([]);
    navigate(`/news/${id}`);
    setIsMobileMenuOpen(false);
  };

  // ── Nav links config — single source of truth ─────────────────────────────
  // Only real pages. Add more here when you build them.
  const NAV_LINKS = [
    { label: 'Home',              to: '/',               type: 'link'   },
    { label: 'News',              type: 'dropdown'                      },
    { label: 'Nepse News',        to: '/stockDashboard', type: 'link'   },
    { label: 'राशिफल',            href: '/rashifalhome', type: 'anchor' },
    { label: 'ट्रेन्डिङ समाचार',  href: '#ट्रेन्डिङसमाचार', type: 'anchor' },
  ];

  // ── Shared: search input ──────────────────────────────────────────────────
  const SearchBox = ({ inputClass = '' }) => (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length > 0 && setIsSearchOpen(true)}
        onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
        className={`pl-3 pr-8 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all ${inputClass}`}
      />
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      {isSearchOpen && searchResults.length > 0 && (
        <div className="absolute right-0 mt-1 w-72 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-[9999]">
          {searchResults.map(item => (
            <button
              key={item.id}
              type="button"
              onMouseDown={() => handleResultClick(item.id)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 hover:text-green-700 border-b border-gray-100 last:border-0 transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Shared: news dropdown panel ───────────────────────────────────────────
  const NewsDropdown = ({ onClose}) => (
    <div className="absolute top-full left-0 w-60 bg-white border-t-2 border-green-600 shadow-2xl rounded-b-xl overflow-hidden z-[9999]">
      {/* "All news" always shown */}
      <Link
        to="/news"
        onClick={onClose}
        className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-green-50 hover:text-green-700 border-b border-gray-100 transition-colors"
      >
        सबै समाचार
      </Link>

      {/* Dynamic categories — only those with news_count > 0 */}
      {categories.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-400 text-center">लोड हो रहेको छ...</div>
      ) : (
        categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${slugify(cat.slug || cat.name)}`}
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 border-b border-gray-100 last:border-0 transition-colors"
          >
            <span>{cat.name}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
              {cat.news_count}
            </span>
          </Link>
        ))
      )}
    </div>
  );

  // ── Render a single desktop nav item ──────────────────────────────────────
  const DesktopNavItem = ({ item, isOpen, setIsOpen }) => {
    const base = 'block px-4 py-3 text-white text-sm font-semibold hover:bg-green-800 transition-colors whitespace-nowrap';
    if (item.type === 'link')   return <li><Link to={item.to} className={base}>{item.label}</Link></li>;
    if (item.type === 'anchor') return <li><a href={item.href} className={base}>{item.label}</a></li>;
    if (item.type === 'dropdown') return (
      <li
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button className={`flex items-center gap-1 ${base}`}>
          {item.label}
          <svg className="w-3.5 h-3.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
        {isOpen && <NewsDropdown onClose={() => setIsOpen(false)} />}
      </li>
    );
    return null;
  };

  // ── Mini nav ──────────────────────────────────────────────────────────────
  const MiniNav = () => (
    <div className={`fixed top-0 left-0 right-0 z-[1001] bg-green-700 shadow-lg transition-transform duration-300 ${showMiniNav ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-[90%] mx-auto px-4 lg:px-6 flex items-center gap-2 py-1.5">
        <Link to="/" className="flex-shrink-0 mr-2">
          <img
            src="https://nepsetalk.com/wp-content/themes/landing_page/images/nepsetalk-logo.png"
            alt="NepseTalk" className="w-9 h-9 rounded"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center flex-1">
         {NAV_LINKS.map((item, i) => (
  <DesktopNavItem
    key={i}
    item={item}
      isOpen={miniNavDropdownOpen}
  setIsOpen={setMiniNavDropdownOpen}
  />
))}
        </ul>

        {/* Search */}
        <div className="hidden lg:block ml-auto">
          <SearchBox inputClass="w-44 bg-white/20 text-white placeholder-white/60" />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(p => !p)}
          className="lg:hidden p-1 text-white ml-auto"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <MiniNav />

      {/* ── Full sticky header ── */}
      <header
        className={`bg-white shadow-md transition-transform duration-300 ${showFullNav ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        {/* Logo + Ad row */}
        <div className="max-w-[90%] mx-auto flex items-center justify-between gap-4 py-2 px-4 lg:px-6 border-b border-gray-100 min-h-[64px]">
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://nepsetalk.com/wp-content/themes/landing_page/images/nepsetalk-logo.png"
              alt="NepseTalk"
              className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px]"
            />
          </Link>
          <div className="hidden md:block flex-1 max-w-[700px] h-[80px] lg:h-[110px] overflow-hidden rounded-lg">
            <AdSlot position="navbar" />
          </div>
          {/* Mobile hamburger (visible in full header) */}
          <button
            onClick={() => setIsMobileMenuOpen(p => !p)}
            className="lg:hidden p-2 text-gray-700 hover:text-green-700"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Green nav bar — desktop only */}
        <nav className="bg-green-700 hidden lg:block relative z-[999]">
          <div className="max-w-[90%] mx-auto px-4 lg:px-6">
            <ul className="flex items-center">
             {NAV_LINKS.map((item, i) => (
  <DesktopNavItem
    key={i}
    item={item}
    isOpen={fullNavDropdownOpen}
    setIsOpen={setFullNavDropdownOpen}
  />
))}
              {/* Search pushed to the right */}
              <li className="ml-auto pr-1">
                <SearchBox inputClass="w-44 bg-white/20 text-white placeholder-white/60" />
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[1002] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-[1003] shadow-2xl flex flex-col overflow-y-auto lg:hidden">

            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 bg-green-700 flex-shrink-0">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="https://nepsetalk.com/wp-content/themes/landing_page/images/nepsetalk-logo.png" alt="logo" className="w-24" />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-green-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile search */}
            <div className="px-4 py-3 bg-green-700 border-t border-green-600 flex-shrink-0">
              <SearchBox inputClass="w-full bg-white/20 text-white placeholder-white/60" />
            </div>

            {/* Links */}
            <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-gray-800 font-semibold text-sm border-b border-gray-100 hover:bg-gray-50">
                Home
              </Link>

              {/* News accordion */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setIsMobileNewsOpen(p => !p)}
                  className="w-full flex items-center justify-between px-5 py-3 text-gray-800 font-semibold text-sm hover:bg-gray-50"
                >
                  News
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isMobileNewsOpen ? 'rotate-180' : ''}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {isMobileNewsOpen && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    <Link to="/news" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-8 py-2.5 text-sm font-bold text-gray-700 hover:text-green-700 border-b border-gray-100 transition-colors">
                      सबै समाचार
                    </Link>
                    {categories.length === 0 ? (
                      <div className="px-8 py-2.5 text-sm text-gray-400">कुनै श्रेणी उपलब्ध छैन</div>
                    ) : (
                      categories.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/category/${slugify(cat.slug || cat.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-8 py-2.5 text-sm text-gray-700 hover:text-green-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full tabular-nums">
                            {cat.news_count}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Link to="/stockDashboard" onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-gray-800 font-semibold text-sm border-b border-gray-100 hover:bg-gray-50">
                Nepse News
              </Link>
              <a href="/rashifalhome" onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-gray-800 font-semibold text-sm border-b border-gray-100 hover:bg-gray-50">
                राशिफल
              </a>
              <a href="#ट्रेन्डिङसमाचार" onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 text-gray-800 font-semibold text-sm border-b border-gray-100 hover:bg-gray-50">
                ट्रेन्डिङ समाचार
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;