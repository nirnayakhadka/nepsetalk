import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, Plus, ChevronDown, Search, Bell, Calendar, RefreshCw } from 'lucide-react';
import { fetchStockMarketData, subscribeMarket } from '../../services/stockMarketApi';
import AdSlot from '../ads/AdSlot';

const Overview = ({ selectedPeriod, setSelectedPeriod }) => {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    // Transform backend data to match old mock shapes
    const getMarketOverview = useCallback(() => {
        if (!marketData?.marketIndex) return [];
        const idx = marketData.marketIndex;
        return [{
            index: 'NEPSE',
            value: idx.value ? idx.value.toLocaleString(undefined, {maximumFractionDigits: 2}) : '—',
            change: idx.change ? (idx.change > 0 ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2)) : '0.00',
            changePercent: idx.percent ? (idx.percent > 0 ? `+${idx.percent.toFixed(2)}%` : `${idx.percent.toFixed(2)}%`) : '0.00%'
        }];
    }, [marketData]);

    const getMarketStats = useCallback(() => {
        if (!marketData) return [];
        const s = marketData.summary || {};
        return [{
            label: 'Total Turnover', 
            value: s.totalTurnover ? `${s.totalTurnover.toLocaleString()} Cr` : '—',
            change: s.turnoverChange || '+12.5%'
        }, {
            label: 'Total Traded Shares', 
            value: s.totalTradedShares ? s.totalTradedShares.toLocaleString() : '—',
            change: s.sharesChange || '+8.3%'
        }, {
            label: 'Total Transactions', 
            value: s.totalTransactions ? s.totalTransactions.toLocaleString() : '—',
            change: s.transactionsChange || '+15.7%'
        }, {
            label: 'Market Cap', 
            value: s.marketCap ? `${s.marketCap.toLocaleString()}T` : '—',
            change: s.marketCapChange || '+2.1%'
        }];
    }, [marketData]);

    const getHeatmapData = useCallback(() => {
        if (!marketData?.sectorSummary) return [];
        return marketData.sectorSummary.slice(0, 10).map(sector => ({
            sector: sector.sectorName || sector.sector,
            performance: Number(sector.change) || 0,
            stocks: Number(sector.noOfStocks) || Number(sector.companies) || 0,
            color: Number(sector.change) > 0 ? 'bg-green-400' : 
                   Number(sector.change) < 0 ? 'bg-red-400' : 'bg-gray-300'
        }));
    }, [marketData]);

    const getTopGainers = useCallback(() => marketData?.gainers || [], [marketData]);
    const getTopLosers = useCallback(() => marketData?.losers || [], [marketData]);
    const getTurnoverLeaders = useCallback(() => marketData?.turnoverLeaders || [], [marketData]);

    const trendData = useCallback(() => {
        if (marketData?.marketChart?.length) return marketData.marketChart;
        // Fallback trend data
        const days = 7;
        const base = Number(marketData?.marketIndex?.value) || 2148;
        return Array.from({length: days}, (_, i) => ({
            date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i] || `Day ${i+1}`,
            value: base + (Math.sin(i) * 30) + (i * 5)
        }));
    }, [marketData]);

    const nepseIndex = marketData?.marketIndex || {};

    useEffect(() => {
        let unsub;
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchStockMarketData();
                setMarketData(data);
                setIsLive(true);
            } catch (err) {
                console.error('Failed to fetch market data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        unsub = subscribeMarket((data, isMarketOpen) => {
            setMarketData(data);
            setIsLive(true);
        });

        return () => unsub && unsub();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto py-32 flex items-center justify-center">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mr-4" />
                <div>
                    <div className="text-xl font-semibold text-gray-900 mb-2">Loading market data...</div>
                    <div className="text-sm text-gray-500">Connecting to NEPSE live feed</div>
                </div>
            </div>
        );
    }

    const marketOverview = getMarketOverview();
    const marketStats = getMarketStats();
    const heatmapData = getHeatmapData();
    const topGainersData = getTopGainers();
    const topLosersData = getTopLosers();
    const turnoverLeadersData = getTurnoverLeaders();
    const chartData = trendData();

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Hero Banner Ad */}
            <AdSlot position="hero_banner" className="mb-6" />

            {/* Market Indices */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {marketOverview.map((market, idx) => {
                    const IconComponent = Number(marketData?.marketIndex?.change || 0) >= 0 ? TrendingUp : TrendingDown;
                    return (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600">{market.index}</div>
                                <IconComponent className={`w-5 h-5 ${market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{market.value}</div>
                            <div className={`text-sm font-medium ${market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {market.change} ({market.changePercent})
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {marketStats.map((stat, idx) => {
                    const icons = [DollarSign, Activity, BarChart3, PieChart];
                    const IconComponent = icons[idx % icons.length];
                    return (
                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 shadow-sm border border-blue-100">
                            <div className="flex items-center justify-between mb-3">
                                <IconComponent className="w-8 h-8 text-blue-600" />
                                <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* Chart + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">NEPSE Index Performance</h2>
                        <div className="flex space-x-2">
                            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
                                <button key={period} onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1 text-sm rounded-md transition ${selectedPeriod === period ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="text-3xl font-bold text-gray-900">{nepseIndex.value?.toLocaleString(undefined, {maximumFractionDigits: 2}) || '—'}</div>
                        <div className={`font-medium flex items-center ${nepseIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {nepseIndex.change !== undefined && (
                                <>
                                    {nepseIndex.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    {nepseIndex.change ? (nepseIndex.change > 0 ? `+${nepseIndex.change.toFixed(2)}` : nepseIndex.change.toFixed(2)) : '0.00'}
                                    {' ('}
                                    {nepseIndex.percent ? (nepseIndex.percent > 0 ? `+${nepseIndex.percent.toFixed(2)}%` : `${nepseIndex.percent.toFixed(2)}%`) : '0.00%'}
                                    {')'}
                                </>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                            <div className="flex items-center">
                                <Plus className="w-5 h-5 text-blue-600 mr-3" />
                                <span className="font-medium text-gray-900">Add to Watchlist</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition">
                            <div className="flex items-center">
                                <Search className="w-5 h-5 text-green-600 mr-3" />
                                <span className="font-medium text-gray-900">Stock Screener</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-purple-600 mr-3" />
                                <span className="font-medium text-gray-900">Price Alerts</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                                <span className="font-medium text-gray-900">Market Calendar</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gainers/Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />Top Gainers
                    </h2>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topGainersData.slice(0, 5).map((stock, idx) => (
                            <div key={stock.symbol || idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                                    <div className="text-xs text-gray-500">{stock.companyName || '—'}</div>
                                    <div className="text-xs text-gray-400 mt-1">Vol: {stock.volume?.toLocaleString() || '—'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">Rs. {Number(stock.ltp || stock.price).toLocaleString()}</div>
                                    <div className="text-sm font-medium text-green-600">
                                        +{Number(stock.percent || stock.changePercent || 0).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 text-red-600 mr-2" />Top Losers
                    </h2>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topLosersData.slice(0, 5).map((stock, idx) => (
                            <div key={stock.symbol || idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                                    <div className="text-xs text-gray-500">{stock.companyName || '—'}</div>
                                    <div className="text-xs text-gray-400 mt-1">Vol: {stock.volume?.toLocaleString() || '—'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">Rs. {Number(stock.ltp || stock.price).toLocaleString()}</div>
                                    <div className="text-sm font-medium text-red-600">
                                        {Number(stock.percent || stock.changePercent || 0).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sector Performance Heatmap</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {heatmapData.map((sector, idx) => (
                        <div key={idx} className={`${sector.color} rounded-lg p-4 text-center transition hover:opacity-80 cursor-pointer`}>
                            <div className="font-semibold text-gray-900 text-sm mb-1 truncate">{sector.sector}</div>
                            <div className={`text-lg font-bold ${sector.performance > 0 ? 'text-green-800' : 'text-red-800'}`}>
                                {sector.performance > 0 ? '+' : ''}{sector.performance}%
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{sector.stocks} stocks</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Turnover Leaders Table */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />Turnover Leaders
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Symbol</th>
                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Turnover (Cr)</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">LTP</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Volume</th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">% Chg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnoverLeadersData.slice(0, 10).map((stock, idx) => (
                                <tr key={stock.symbol || idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-2 font-semibold text-gray-900">{stock.symbol}</td>
                                    <td className="py-3 px-2 text-sm text-gray-600 truncate max-w-[120px]">{stock.companyName || stock.name || '—'}</td>
                                    <td className="py-3 px-2 text-right font-semibold text-blue-600">
                                        {Number(stock.turnover || 0).toLocaleString(undefined, {maximumFractionDigits: 1})}
                                    </td>
                                    <td className="py-3 px-2 text-right text-gray-900">
                                        Rs. {Number(stock.ltp || stock.price || 0).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-2 text-right text-sm text-gray-600">
                                        {Number(stock.volume || 0).toLocaleString()}
                                    </td>
                                    <td className={`py-3 px-2 text-right font-medium ${
                                        Number(stock.percent || stock.changePercent || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {Number(stock.percent || stock.changePercent || 0) > 0 ? '+' : ''}{Number(stock.percent || stock.changePercent || 0).toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Live indicator */}
            {marketData && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                    {isLive ? '🟢 Live data' : '💾 Cached data'} • 
                    Updated {new Date(marketData.fetchedAt || Date.now()).toLocaleTimeString()} • 
                    Source: {marketData.source || 'NEPSE'}
                </div>
            )}
        </div>
    );
};

export default Overview;

