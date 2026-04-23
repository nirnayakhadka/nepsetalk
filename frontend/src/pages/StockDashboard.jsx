// pages/StockDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';
import { fetchStockMarketData, subscribeMarket, requestSocketUpdate } from '../services/stockMarketApi';

// ── Tab components (lazy-loaded inline) ────────────────────────────────────
import Overview  from '../components/Nepse/Overview';
import Markets   from '../components/Nepse/Markets';
import Watchlist from '../components/Nepse/Watchlist';
import Portfolio from '../components/Nepse/Portfolio';
import NewsTab   from '../components/Nepse/News';
import Analysis  from '../components/Nepse/Analysis';

function timeAgo(date) {
  if (!date) return '';
  const diff = Math.round((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const TABS = ['Overview', 'Markets', 'Watchlist', 'Portfolio', 'News', 'Analysis'];

const StockDashboard = () => {
  const [activeTab, setActiveTab]         = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [searchQuery, setSearchQuery]     = useState('');
  const [marketData, setMarketData]       = useState(null);
  const [isLive, setIsLive]               = useState(false);
  const [isMarketOpen, setIsMarketOpen]   = useState(false);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [loading, setLoading]             = useState(true);

  // ── Shared market data fetch (passed down to all tabs) ──────────────────
  const fetchREST = useCallback(async () => {
    try {
      const data = await fetchStockMarketData();
      setMarketData(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('[Dashboard] fetch error:', err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchREST();

    const unsub = subscribeMarket((data, open) => {
      setMarketData(data);
      setIsMarketOpen(open);
      setIsLive(true);
      setLoading(false);
      setLastUpdated(new Date());
    });

    return () => unsub();
  }, [fetchREST]);

  // ── Shared props passed to every tab ────────────────────────────────────
  const sharedProps = {
    marketData,
    loading,
    isMarketOpen,
    selectedPeriod,
    setSelectedPeriod,
    searchQuery,
    setSearchQuery,
    onRefresh: fetchREST,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':  return <Overview  {...sharedProps} />;
      case 'markets':   return <Markets   {...sharedProps} />;
      case 'watchlist': return <Watchlist {...sharedProps} />;
      case 'portfolio': return <Portfolio {...sharedProps} />;
      case 'news':      return <NewsTab   {...sharedProps} />;
      case 'analysis':  return <Analysis  {...sharedProps} />;
      default:          return <Overview  {...sharedProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="max-w-[90%] mx-auto bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">NEPSE Markets</h1>
            {/* Live / cached badge */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isMarketOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              {isMarketOpen ? 'बजार खुला' : 'बजार बन्द'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {isLive
                ? <Wifi className="w-3.5 h-3.5 text-green-500" />
                : <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              }
              <span className="hidden sm:inline">{isLive ? 'Live' : 'Polling'}</span>
            </div>
            {lastUpdated && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {timeAgo(lastUpdated)}
              </span>
            )}
            <button
              onClick={() => { requestSocketUpdate(); fetchREST(); }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 max-w-[90%] mx-auto">
        <div className="flex space-x-1 sm:space-x-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.toLowerCase()
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <AdSlot position="hero_banner" className="mb-6" />

      <div className="w-full mx-auto px-6 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default StockDashboard;