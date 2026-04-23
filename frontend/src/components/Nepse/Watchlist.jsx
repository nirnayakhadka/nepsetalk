// components/Nepse/Watchlist.jsx
import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'nepse_watchlist';

const Watchlist = ({ marketData, searchQuery, setSearchQuery }) => {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
  });
  const [search, setSearch] = useState(searchQuery ?? '');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  // All available stocks from market data
  const allStocks = React.useMemo(() => {
    const map = new Map();
    [...(marketData?.gainers ?? []),
     ...(marketData?.losers ?? []),
     ...(marketData?.turnoverLeaders ?? [])
    ].forEach(s => { if (s.symbol) map.set(s.symbol, s); });
    return Array.from(map.values());
  }, [marketData]);

  const searchResults = search.length > 1
    ? allStocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) && !watchlist.includes(s.symbol))
    : [];

  const watchedStocks = allStocks.filter(s => watchlist.includes(s.symbol));

  const addToWatchlist = (symbol) => {
    setWatchlist(prev => [...new Set([...prev, symbol])]);
    setSearch('');
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          मेरो Watchlist
        </h2>
        <span className="text-xs text-gray-400">{watchlist.length} stocks</span>
      </div>

      {/* Search to add */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Symbol थप्नुहोस् (e.g. NICA, NTC)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
            {searchResults.map(s => (
              <button
                key={s.symbol}
                onClick={() => addToWatchlist(s.symbol)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
              >
                <span className="font-bold text-gray-900 text-sm">{s.symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rs {Number(s.ltp ?? 0).toLocaleString()}</span>
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist */}
      {watchedStocks.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {watchedStocks.map(stock => {
              const isPositive = (stock.percent ?? 0) >= 0;
              return (
                <div key={stock.symbol} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                      {isPositive ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">Rs {Number(stock.ltp ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold text-sm">{(stock.change ?? 0) >= 0 ? '+' : ''}{Number(stock.change ?? 0).toFixed(2)}</p>
                      <p className="text-xs">{(stock.percent ?? 0) >= 0 ? '+' : ''}{Number(stock.percent ?? 0).toFixed(2)}%</p>
                    </div>
                    <button onClick={() => removeFromWatchlist(stock.symbol)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Watchlist खाली छ</p>
          <p className="text-gray-400 text-sm mt-1">माथि symbol खोजेर थप्नुहोस्</p>
        </div>
      )}

      {watchlist.length > 0 && watchedStocks.length < watchlist.length && (
        <p className="text-xs text-amber-600 text-center">
          {watchlist.length - watchedStocks.length} stock(s) हाल बजार डाटामा उपलब्ध छैन
        </p>
      )}
    </div>
  );
};

export default Watchlist;


// ─────────────────────────────────────────────────────────────────────────────
// components/Nepse/Portfolio.jsx  (save as separate file)
// ─────────────────────────────────────────────────────────────────────────────
export const Portfolio = ({ marketData }) => {
  const [holdings, setHoldings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nepse_portfolio') ?? '[]'); }
    catch { return []; }
  });
  const [form, setForm] = useState({ symbol: '', qty: '', avgCost: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('nepse_portfolio', JSON.stringify(holdings));
  }, [holdings]);

  const allStocks = React.useMemo(() => {
    const map = new Map();
    [...(marketData?.gainers ?? []), ...(marketData?.losers ?? []), ...(marketData?.turnoverLeaders ?? [])]
      .forEach(s => { if (s.symbol) map.set(s.symbol, s); });
    return map;
  }, [marketData]);

  const addHolding = () => {
    if (!form.symbol || !form.qty || !form.avgCost) { setError('सबै फिल्ड भर्नुहोस्'); return; }
    setHoldings(prev => [...prev, { ...form, qty: Number(form.qty), avgCost: Number(form.avgCost) }]);
    setForm({ symbol: '', qty: '', avgCost: '' });
    setError('');
  };

  const totalInvested = holdings.reduce((s, h) => s + h.qty * h.avgCost, 0);
  const totalCurrent  = holdings.reduce((s, h) => {
    const ltp = allStocks.get(h.symbol.toUpperCase())?.ltp ?? h.avgCost;
    return s + h.qty * Number(ltp);
  }, 0);
  const pnl = totalCurrent - totalInvested;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-800">मेरो Portfolio</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Invested', value: `Rs ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-gray-900' },
          { label: 'Current',  value: `Rs ${totalCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,  color: 'text-gray-900' },
          { label: 'P&L',      value: `${pnl >= 0 ? '+' : ''}Rs ${Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: pnl >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add holding form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">नयाँ Holding थप्नुहोस्</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <input placeholder="Symbol (e.g. NICA)" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Quantity" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Avg Cost (Rs)" value={form.avgCost} onChange={e => setForm(f => ({ ...f, avgCost: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button onClick={addHolding} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          थप्नुहोस्
        </button>
      </div>

      {/* Holdings list */}
      {holdings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Symbol', 'Qty', 'Avg Cost', 'LTP', 'Invested', 'Current', 'P&L', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {holdings.map((h, i) => {
                  const ltp = Number(allStocks.get(h.symbol)?.ltp ?? h.avgCost);
                  const invested = h.qty * h.avgCost;
                  const current  = h.qty * ltp;
                  const pnl      = current - invested;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900 text-sm">{h.symbol}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{h.qty}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Rs {h.avgCost}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">Rs {ltp.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Rs {invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Rs {current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : ''}Rs {Math.abs(pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setHoldings(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs">हटाउनुहोस्</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {holdings.length === 0 && (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">अझै कुनै holding छैन। माथिको form बाट थप्नुहोस्।</p>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// components/Nepse/News.jsx  (save as separate file)
// ─────────────────────────────────────────────────────────────────────────────
import { getNews, getImageUrl } from '../../services/adminApi';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export const NewsTab = () => {
  const [news, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews('?limit=20&category=stock')
      .then(d => setNewsData(d))
      .catch(() => getNews('?limit=20').then(d => setNewsData(d)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">बजार समाचार</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {news.map(item => (
          <Link key={item.id} to={`/news/${item.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            {item.image && (
              <div className="h-40 overflow-hidden bg-gray-100">
                <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  <Flame className="w-3 h-3" /> {item.category_name ?? 'समाचार'}
                </span>
                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('ne')}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
        {news.length === 0 && <p className="text-gray-400 text-sm col-span-3 text-center py-10">समाचार उपलब्ध छैन</p>}
      </div>
    </div>
  );
};