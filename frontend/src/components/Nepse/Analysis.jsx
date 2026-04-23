// components/Nepse/Analysis.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchMarketHistory, fetchDailyStats } from '../../services/stockMarketApi';

const Analysis = ({ marketData }) => {
  const [history, setHistory]       = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [days, setDays]             = useState(30);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    loadHistory();
  }, [days]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [h, d] = await Promise.all([
        fetchMarketHistory(days),
        fetchDailyStats(days),
      ]);
      setHistory(h ?? []);
      setDailyStats(d ?? []);
    } catch (err) {
      console.error('[Analysis] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format history for chart
  const chartData = history.map(r => ({
    time: new Date(r.time).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: Number(r.value ?? 0),
    turnover: Number(r.turnover ?? 0),
  }));

  const dailyChartData = dailyStats.map(r => ({
    date: r.date,
    high: Number(r.high ?? 0),
    low: Number(r.low ?? 0),
    avg: Number(r.avg ?? 0),
    turnover: Number(r.totalTurnover ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">ऐतिहासिक विश्लेषण</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                days === d ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Index history */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              NEPSE Index — {days} दिनको इतिहास
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#histGrad)" name="Index" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 py-12 text-sm">
                {days} दिनको डाटा संकलन हुँदैछ। बजार खुल्दा स्वत: सुरु हुन्छ।
              </p>
            )}
          </div>

          {/* Daily High/Low/Avg */}
          {dailyChartData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">दैनिक High / Low / Average</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="high" fill="#10b981" name="High" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="avg"  fill="#3b82f6" name="Avg"  radius={[2, 2, 0, 0]} />
                  <Bar dataKey="low"  fill="#ef4444" name="Low"  radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary stats */}
          {dailyChartData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Highest', value: Math.max(...dailyChartData.map(d => d.high)).toFixed(2), color: 'text-green-600' },
                { label: 'Lowest',  value: Math.min(...dailyChartData.map(d => d.low)).toFixed(2),  color: 'text-red-600' },
                { label: 'Avg Index', value: (dailyChartData.reduce((s, d) => s + d.avg, 0) / dailyChartData.length).toFixed(2), color: 'text-blue-600' },
                { label: 'Data Points', value: history.length, color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {chartData.length === 0 && dailyChartData.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700 font-medium text-sm">
                अझै पर्याप्त इतिहास छैन। बजार खुलेपछि डाटा स्वत: संकलन हुन्छ (Sun–Thu 11:00–15:00 NST)।
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analysis;