/**
 * components/Nepse/StockCharts.jsx
 *
 * Connects to the live NEPSE backend.
 * - Uses Socket.IO for real-time updates when market is open
 * - Falls back to REST polling (every 5 min) when socket unavailable
 * - Gracefully shows stale data with a staleness indicator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight,
  BarChart3, DollarSign, RefreshCw, AlertCircle, LineChart as LineIcon,
  Zap, Users, Wifi, WifiOff, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchStockMarketData,
  subscribeMarket,
  requestSocketUpdate,
} from '../../services/stockMarketApi';

// ─── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return 'never';
  const diff = Math.round((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Sub-components ────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, isPositive, icon, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <div className={`p-2.5 rounded-lg ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} group-hover:scale-110 transition-transform`}>
        {React.createElement(icon, { className: 'w-5 h-5' })}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      )}
    </div>
  </div>
);

const StockRow = ({ item, isPositive, showTurnover = false, index }) => (
  <div className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-all duration-200 group cursor-pointer border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="text-gray-400 font-bold text-sm w-6 flex-shrink-0">{index + 1}</div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} group-hover:scale-110 transition-transform`}>
        {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">{item.symbol}</p>
        <p className="text-xs text-gray-500">Rs {item.ltp?.toLocaleString()}</p>
        {!showTurnover && item.high && (
          <p className="text-xs text-gray-400 mt-0.5">H: {item.high} | L: {item.low}</p>
        )}
      </div>
    </div>
    {showTurnover ? (
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-bold text-gray-900 text-sm">Rs {item.turnover?.toFixed(1)}M</p>
        <span className={`text-xs font-semibold ${item.percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.percent > 0 ? '+' : ''}{item.percent}%
        </span>
      </div>
    ) : (
      <div className={`flex flex-col items-end flex-shrink-0 ml-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <span className="font-bold text-sm">{item.change > 0 ? '+' : ''}{item.change}</span>
        <span className="text-xs">({item.percent > 0 ? '+' : ''}{item.percent}%)</span>
      </div>
    )}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────
const StockCharts = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const pollRef = useRef(null);
  const unsubRef = useRef(null);

  // ── REST fallback fetch ───────────────────────────────────────────────
  const fetchREST = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await fetchStockMarketData();
      setMarketData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('[StockCharts] REST error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket subscription ───────────────────────────────────────────────
  useEffect(() => {
    // Initial load via REST
    fetchREST(true);

    // Then try socket
    let socketFailed = false;
    const timeout = setTimeout(() => {
      // If socket hasn't connected in 5s, start polling
      if (!isLive) {
        console.warn('[StockCharts] Socket timeout, switching to poll');
        socketFailed = true;
        pollRef.current = setInterval(() => fetchREST(false), 5 * 60_000);
      }
    }, 5000);

    unsubRef.current = subscribeMarket((data, open) => {
      clearTimeout(timeout);
      if (socketFailed && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setMarketData(data);
      setIsMarketOpen(open);
      setIsLive(true);
      setLoading(false);
      setError(null);
      setLastUpdated(new Date());
    });

    return () => {
      clearTimeout(timeout);
      if (pollRef.current) clearInterval(pollRef.current);
      if (unsubRef.current) unsubRef.current();
    };
  }, []); // eslint-disable-line

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading && !marketData) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-[90%] mx-auto flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">बजारको डाटा लोड हुँदैछ…</p>
          </div>
        </div>
      </section>
    );
  }

  // ─── Error (no cached data either) ────────────────────────────────────
  if (error && !marketData) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[90%] mx-auto flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => fetchREST(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              फेरि प्रयास गर्नुहोस्
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div id="nepsecharts" className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md border border-gray-200 mb-4">
          <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">
            {isLive ? 'Live Market Data' : 'Cached Market Data'}
          </span>
          {/* Live / Stale indicator */}
          {isLive ? (
            <Wifi className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
          )}
          <button
            onClick={() => {
              requestSocketUpdate();
              if (!isLive) fetchREST(false);
            }}
            className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Market open/closed badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${isMarketOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isMarketOpen ? 'बजार खुला छ' : 'बजार बन्द छ'}
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo(lastUpdated)}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">नेप्से बजार विश्लेषण</h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
          Nepal Stock Exchange — live gainers, losers & volume leaders
        </p>

        {/* Source badge */}
        {marketData?.source && (
          <span className="text-xs text-gray-400">
            Source: <span className="font-medium text-gray-600">{marketData.source}</span>
          </span>
        )}

        {/* Stale warning */}
        {error && marketData && (
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Showing cached data — live feed temporarily unavailable
          </div>
        )}
      </div>

      {/* Market Index Chart */}
      {marketData?.marketChart && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LineIcon className="w-5 h-5 text-blue-600" />
                NEPSE Index Trend
              </h3>
              <p className="text-sm text-gray-500 mt-1">Today's market performance</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{marketData.marketIndex?.value?.toFixed(2)}</p>
              <p className={`text-sm font-semibold ${marketData.marketIndex?.percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marketData.marketIndex?.change > 0 ? '+' : ''}{marketData.marketIndex?.change?.toFixed(2)} ({marketData.marketIndex?.percent > 0 ? '+' : ''}{marketData.marketIndex?.percent}%)
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marketData.marketChart}>
              <defs>
                <linearGradient id="colorNepse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorNepse)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Market Index"
          value={marketData?.marketIndex?.value?.toFixed(2) ?? '—'}
          change={marketData?.marketIndex?.percent}
          isPositive={(marketData?.marketIndex?.percent ?? 0) > 0}
          icon={BarChart3}
          subtitle={`Prev: ${marketData?.marketIndex?.previousClose?.toFixed(2) ?? '—'}`}
        />
        <StatCard
          title="Total Turnover"
          value={`${marketData?.totalTurnover?.value ?? '—'}${marketData?.totalTurnover?.unit ?? ''}`}
          change={marketData?.totalTurnover?.change}
          isPositive
          icon={DollarSign}
          subtitle="Nepali Rupees"
        />
        <StatCard
          title="Active Stocks"
          value={marketData?.activeStocks?.value ?? 0}
          change={undefined}
          isPositive
          icon={Users}
          subtitle={`↑ ${marketData?.activeStocks?.gainers ?? 0} | ↓ ${marketData?.activeStocks?.losers ?? 0}`}
        />
      </div>

      {/* Gainers / Losers / Turnover */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gainers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Top Gainers
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {(marketData?.gainers ?? []).map((item, i) => (
              <StockRow key={item.symbol + i} item={item} isPositive index={i} />
            ))}
            {!marketData?.gainers?.length && (
              <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" /> Top Losers
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {(marketData?.losers ?? []).map((item, i) => (
              <StockRow key={item.symbol + i} item={item} isPositive={false} index={i} />
            ))}
            {!marketData?.losers?.length && (
              <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Turnover */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" /> Turnover Leaders
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {(marketData?.turnoverLeaders ?? []).map((item, i) => (
              <StockRow key={item.symbol + i} item={item} isPositive={(item.percent ?? 0) > 0} showTurnover index={i} />
            ))}
            {!marketData?.turnoverLeaders?.length && (
              <p className="text-center text-gray-400 py-8 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {isLive ? '🟢 Live via WebSocket' : '🟡 Polling fallback'} •
          Last updated: {lastUpdated?.toLocaleTimeString() ?? '—'} •
          Data refreshes every {isMarketOpen ? '30 seconds' : '5 minutes'}
        </p>
      </div>
    </section>
  );
};

export default StockCharts;