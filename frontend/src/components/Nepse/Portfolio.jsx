import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, CheckCircle, Award, Briefcase, Target, Trash2, Plus, RefreshCw } from 'lucide-react';
import { fetchStockMarketData, subscribeMarket } from '../../services/stockMarketApi';

const STORAGE_KEY = 'nepse_portfolio_holdings';

const Portfolio = () => {
    const [holdings, setHoldings] = useState([]);
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ symbol: '', shares: '', avgPrice: '' });

    // Load holdings from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setHoldings(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load portfolio:', e);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (holdings.length === 0) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
        } catch (e) {
            console.error('Failed to save portfolio:', e);
        }
    }, [holdings]);

    // Market data subscription
    useEffect(() => {
        let unsub;
        const loadMarket = async () => {
            try {
                setLoading(true);
                const data = await fetchStockMarketData();
                setMarketData(data);
            } catch (e) {
                console.error('Market data failed:', e);
            } finally {
                setLoading(false);
            }
        };

        loadMarket();
        unsub = subscribeMarket(setMarketData);
        return () => unsub?.();
    }, []);

    // All available LTPs from market data
    const ltpMap = useCallback(() => {
        if (!marketData) return new Map();
        const map = new Map();
        [...(marketData.gainers || []), ...(marketData.losers || []), ...(marketData.turnoverLeaders || [])].forEach(stock => {
            if (stock.symbol) map.set(stock.symbol.toUpperCase(), Number(stock.ltp || stock.price || 0));
        });
        return map;
    }, [marketData]);

    const addHolding = () => {
        const symbol = form.symbol.toUpperCase().trim();
        const shares = Number(form.shares);
        const avgPrice = Number(form.avgPrice);
        
        if (!symbol || !shares || !avgPrice || shares <= 0 || avgPrice <= 0) {
            alert('Please enter valid symbol, shares, and average price');
            return;
        }

        const newHolding = {
            symbol,
            shares,
            avgPrice,
            addedAt: new Date().toISOString()
        };
        setHoldings(prev => [newHolding, ...prev.slice(0, 9)]); // Keep top 10
        setForm({ symbol: '', shares: '', avgPrice: '' });
    };

    const removeHolding = (index) => {
        setHoldings(prev => prev.filter((_, i) => i !== index));
    };

    const computedHoldings = holdings.map(holding => {
        const currentPrice = ltpMap().get(holding.symbol) || holding.avgPrice;
        const value = holding.shares * holding.avgPrice;
        const currentValue = holding.shares * currentPrice;
        const gain = currentValue - value;
        const gainPercent = value > 0 ? (gain / value * 100) : 0;

        return {
            ...holding,
            currentPrice,
            value,
            currentValue,
            gain,
            gainPercent
        };
    });

    const totalValue = computedHoldings.reduce((sum, h) => sum + h.value, 0);
    const totalCurrent = computedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalGain = totalCurrent - totalValue;
    const totalGainPercent = totalValue > 0 ? (totalGain / totalValue * 100) : 0;

    // Sector pie data from holdings
    const sectorPieData = useCallback(() => {
        const sectors = {};
        computedHoldings.forEach(h => {
            const sector = h.sector || 'Others';
            sectors[sector] = (sectors[sector] || 0) + h.currentValue;
        });
        return Object.entries(sectors).map(([name, value]) => ({
            name,
            value,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 6)]
        })).slice(0, 6);
    }, [computedHoldings]);

    const trendData = useCallback(() => {
        if (!marketData?.marketChart) return [];
        return marketData.marketChart.slice(-30); // Last 30 points
    }, [marketData]);

    if (loading && holdings.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p>Loading market data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div className="text-sm opacity-90 mb-2">Total Invested</div>
                    <div className="text-2xl lg:text-3xl font-bold">Rs. {totalValue.toLocaleString()}</div>
                </div>

                <div className={`bg-gradient-to-br ${totalGain >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white rounded-xl p-6 shadow-xl`}>
                    <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <div className="text-sm opacity-90 mb-2">Total P&L</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                        {totalGain >= 0 ? '+' : ''}Rs. {Math.abs(totalGain).toLocaleString()}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="text-sm opacity-90 mb-2">Return %</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                        {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <div className="text-sm opacity-90 mb-2">Active Holdings</div>
                    <div className="text-2xl lg:text-3xl font-bold">{holdings.length}</div>
                </div>
            </div>

            {/* Add Holding Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Plus className="w-6 h-6 text-blue-600 mr-2" /> Add Holding
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input 
                        placeholder="Symbol (e.g. NABIL)"
                        value={form.symbol}
                        onChange={(e) => setForm({...form, symbol: e.target.value.toUpperCase()})}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input 
                        type="number" 
                        placeholder="Shares"
                        value={form.shares}
                        onChange={(e) => setForm({...form, shares: e.target.value})}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input 
                        type="number" 
                        placeholder="Avg Price (Rs)"
                        value={form.avgPrice}
                        onChange={(e) => setForm({...form, avgPrice: e.target.value})}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button 
                    onClick={addHolding}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Portfolio
                </button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Portfolio Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={trendData()}>
                            <defs>
                                <linearGradient id="portfolioTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#portfolioTrend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Portfolio Allocation</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <RechartsPie>
                            <Pie data={sectorPieData()} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="value">
                                {sectorPieData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </RechartsPie>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Briefcase className="w-6 h-6 mr-2" />
                        My Holdings ({computedHoldings.length})
                    </h3>
                </div>
                {computedHoldings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Symbol</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Shares</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Avg Price</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Current</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Value</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">P&L</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {computedHoldings.map((holding, idx) => (
                                    <tr key={holding.symbol + idx} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 font-semibold text-gray-900">{holding.symbol}</td>
                                        <td className="py-4 px-6 text-right font-mono text-sm">{holding.shares.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-right font-mono">Rs {holding.avgPrice.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-right font-semibold font-mono">
                                            Rs {holding.currentPrice.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-right font-semibold text-blue-600 font-mono">
                                            Rs {holding.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        </td>
                                        <td className={`py-4 px-6 text-right font-bold font-mono ${
                                            holding.gain >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {holding.gain >= 0 ? '+' : ''}Rs {Math.abs(holding.gain).toLocaleString()}
                                        </td>
                                        <td className={`py-4 px-6 text-right font-bold font-mono ${
                                            holding.gainPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</h4>
                        <p className="text-gray-500 mb-6">Add your first stock holding using the form above</p>
                        <p className="text-sm text-gray-400">Current prices from live NEPSE data</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;

