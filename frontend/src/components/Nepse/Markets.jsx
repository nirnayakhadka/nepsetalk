// components/Nepse/Markets.jsx
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react';

const Markets = ({ marketData, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('turnover');
  const [sortDir, setSortDir] = useState('desc');

  // Merge gainers + losers + turnoverLeaders into one deduplicated table
  const allStocks = React.useMemo(() => {
    const map = new Map();
    [...(marketData?.gainers ?? []),
     ...(marketData?.losers ?? []),
     ...(marketData?.turnoverLeaders ?? [])
    ].forEach(s => { if (s.symbol) map.set(s.symbol, s); });
    return Array.from(map.values());
  }, [marketData]);

  const filtered = allStocks
    .filter(s => s.symbol?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = Number(a[sortBy] ?? 0);
      const bv = Number(b[sortBy] ?? 0);
      return sortDir === 'desc' ? bv - av : av - bv;
    });

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortHeader = ({ col, label }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-gray-800 select-none"
    >
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  if (loading && !marketData) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">सबै स्टक</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Symbol खोज्नुहोस्..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                <SortHeader col="symbol" label="Symbol" />
                <SortHeader col="ltp" label="LTP (Rs)" />
                <SortHeader col="change" label="Change" />
                <SortHeader col="percent" label="%" />
                <SortHeader col="high" label="High" />
                <SortHeader col="low" label="Low" />
                <SortHeader col="turnover" label="Turnover (M)" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((stock, i) => {
                const isPositive = (stock.percent ?? 0) >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                          {isPositive
                            ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                            : <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                          }
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-sm">{Number(stock.ltp ?? 0).toLocaleString()}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {(stock.change ?? 0) >= 0 ? '+' : ''}{Number(stock.change ?? 0).toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {(stock.percent ?? 0) >= 0 ? '+' : ''}{Number(stock.percent ?? 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stock.high ? Number(stock.high).toFixed(1) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stock.low ? Number(stock.low).toFixed(1) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stock.turnover ? Number(stock.turnover).toFixed(1) : '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-10 text-sm">
                    {search ? 'कुनै नतिजा भेटिएन' : 'डाटा उपलब्ध छैन'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} stocks • Source: {marketData?.source ?? '—'}
        </div>
      </div>
    </div>
  );
};

export default Markets;