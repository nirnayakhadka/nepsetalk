// components/Nepse/Overview.jsx
import React from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, DollarSign, Users,
  ArrowUpRight, ArrowDownRight, RefreshCw, Zap, LineChart as LineIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const StatCard = ({ title, value, change, isPositive, icon, subtitle }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-bold text-gray-500">{title}</p>
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} group-hover:scale-110 transition-transform`}>
        {React.createElement(icon, { className: 'w-4 h-4' })}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    {change !== undefined && (
      <div className={`flex items-center gap-1 text-sm font-semibold mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{change > 0 ? '+' : ''}{change}%</span>
      </div>
    )}
  </div>
);

const StockRow = ({ item, isPositive, index }) => (
  <div className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group cursor-pointer border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="text-gray-400 font-bold text-xs w-5">{index + 1}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{item.symbol}</p>
        <p className="text-xs text-gray-500">Rs {Number(item.ltp ?? 0).toLocaleString()}</p>
      </div>
    </div>
    <div className={`flex flex-col items-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      <span className="font-bold text-sm">{(item.change ?? 0) > 0 ? '+' : ''}{Number(item.change ?? 0).toFixed(2)}</span>
      <span className="text-xs">({(item.percent ?? 0) > 0 ? '+' : ''}{Number(item.percent ?? 0).toFixed(2)}%)</span>
    </div>
  </div>
);

const Overview = ({ marketData, loading, isMarketOpen, selectedPeriod, setSelectedPeriod, onRefresh }) => {
  if (loading && !marketData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const idx = marketData?.marketIndex ?? {};
  const turnover = marketData?.totalTurnover ?? {};
  const active = marketData?.activeStocks ?? {};

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">बजार सारांश</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['1D', '1W', '1M', '3M', '1Y'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                selectedPeriod === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="NEPSE Index"
          value={idx.value ? Number(idx.value).toFixed(2) : '—'}
          change={idx.percent}
          isPositive={(idx.percent ?? 0) >= 0}
          icon={BarChart3}
          subtitle={`Prev Close: ${idx.previousClose ? Number(idx.previousClose).toFixed(2) : '—'}`}
        />
        <StatCard
          title="Total Turnover"
          value={`${turnover.value ?? '—'} ${turnover.unit ?? ''}`}
          isPositive
          icon={DollarSign}
          subtitle="Nepali Rupees"
        />
        <StatCard
          title="Active Stocks"
          value={active.value ?? 0}
          isPositive
          icon={Users}
          subtitle={`↑ ${active.gainers ?? 0} Gainers  |  ↓ ${active.losers ?? 0} Losers`}
        />
      </div>

      {/* Index chart */}
      {marketData?.marketChart?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-blue-600" /> NEPSE Index Trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Today's intraday movement</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{idx.value ? Number(idx.value).toFixed(2) : '—'}</p>
              <p className={`text-xs font-semibold ${(idx.percent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(idx.change ?? 0) >= 0 ? '+' : ''}{Number(idx.change ?? 0).toFixed(2)} ({(idx.percent ?? 0) >= 0 ? '+' : ''}{Number(idx.percent ?? 0).toFixed(2)}%)
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={marketData.marketChart}>
              <defs>
                <linearGradient id="nepseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#nepseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gainers & Losers side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="font-bold text-gray-900">Top Gainers</h3>
            <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Bullish</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(marketData?.gainers ?? []).slice(0, 8).map((item, i) => (
              <StockRow key={item.symbol + i} item={item} isPositive index={i} />
            ))}
            {!marketData?.gainers?.length && (
              <p className="text-center text-gray-400 py-8 text-sm">डाटा उपलब्ध छैन</p>
            )}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-gray-900">Top Losers</h3>
            <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">Bearish</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {(marketData?.losers ?? []).slice(0, 8).map((item, i) => (
              <StockRow key={item.symbol + i} item={item} isPositive={false} index={i} />
            ))}
            {!marketData?.losers?.length && (
              <p className="text-center text-gray-400 py-8 text-sm">डाटा उपलब्ध छैन</p>
            )}
          </div>
        </div>
      </div>

      {/* Turnover leaders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900">Turnover Leaders</h3>
          <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Volume</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
          {(marketData?.turnoverLeaders ?? []).slice(0, 8).map((item, i) => (
            <div key={item.symbol + i} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold text-xs w-5">{i + 1}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.symbol}</p>
                  <p className="text-xs text-gray-500">Rs {Number(item.ltp ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">Rs {Number(item.turnover ?? 0).toFixed(1)}M</p>
                <span className={`text-xs font-semibold ${(item.percent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(item.percent ?? 0) >= 0 ? '+' : ''}{Number(item.percent ?? 0).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
          {!marketData?.turnoverLeaders?.length && (
            <p className="text-center text-gray-400 py-8 text-sm">डाटा उपलब्ध छैन</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pb-4">
        Source: <span className="font-medium">{marketData?.source ?? '—'}</span> •
        Fetched: {marketData?.fetchedAt ? new Date(marketData.fetchedAt).toLocaleTimeString() : '—'} •
        Refreshes every {isMarketOpen ? '30 seconds' : '5 minutes'}
      </p>
    </div>
  );
};

export default Overview;