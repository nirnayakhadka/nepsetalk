/**
 * mockData.js - DEPRECATED
 * All hardcoded data replaced with real backend API calls to /api/nepse/market
 * Keeping empty exports for component compatibility during migration.
 * Remove imports & this file after all components updated.
 */

export const portfolioData = [];     // ← Use marketData.marketChart
export const sectorData = [];        // ← Use marketData.sectorSummary  
export const watchlist = [];         // ← Dynamic from marketData.gainers+losers
export const marketOverview = [];    // ← marketData.marketIndex + indices
export const topGainers = [];        // ← marketData.gainers
export const topLosers = [];         // ← marketData.losers  
export const turnoverLeaders = [];   // ← marketData.turnoverLeaders
export const heatmapData = [];       // ← marketData.sectorSummary
export const portfolioHoldings = []; // ← localStorage + marketData LTPs
export const portfolioPieData = [];  // ← Computed from holdings
export const newsData = [];          // ← /api/nepse/news or backend news API
export const analysisData = [];      // ← Analysis.jsx already uses real API
export const marketStats = [];       // ← marketData.summary
export const sectorPerformance = []; // ← marketData.sectorSummary

// Usage in components:
// const [marketData, setMarketData] = useState(null);
// useEffect(() => { fetchStockMarketData().then(setMarketData); }, []);

