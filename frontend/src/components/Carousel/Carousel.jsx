import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Loader } from "lucide-react";
import { fetchStockMarketData, subscribeMarket } from "../../services/stockMarketApi";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Generate logo based on stock symbol
  const getStockLogo = (symbol) => {
    const sectorMap = {
      'NABIL': '🏦', 'ADBL': '🏦', 'EBL': '🏦', 'NBL': '🏦', 'NICA': '🏦',
      'NTC': '📡', 'NCELL': '📱', 'NHPC': '💧', 'CHCL': '💧', 'SHPC': '💧',
      'NLIC': '🛡️', 'ALICL': '🛡️', 'NLG': '🛡️', 'SICL': '🛡️',
      'HDL': '🏭', 'HBL': '🏭', 'UNL': '📊',
    };
    return sectorMap[symbol] || '📈';
  };

  // Format price with proper decimal places
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format change percentage
  const formatChangePercent = (change) => {
    if (!change && change !== 0) return '0.00';
    return change.toFixed(2);
  };

  // Transform sharesansar data to our format
  const transformStockData = (sharesansarData) => {
    if (!sharesansarData || !Array.isArray(sharesansarData)) return [];
    
    return sharesansarData.slice(0, 50).map(item => ({
      symbol: item.symbol,
      name: item.name,
      price: item.ltp || 0,
      change: item.change || 0,
      changePercent: item.percentChange || 0,
      logo: getStockLogo(item.symbol),
      volume: item.volume,
      open: item.open,
      high: item.high,
      low: item.low,
    })).filter(stock => stock.price > 0); // Filter out zero price stocks
  };

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockMarketData();
        
        // Extract sharesansar live trading data
        const sharesansarData = data?._raw?.sources?.sharesansar?.liveTrading?.data;
        
        if (sharesansarData && sharesansarData.length > 0) {
          const formattedStocks = transformStockData(sharesansarData);
          setStocks(formattedStocks);
          console.log(`✅ Loaded ${formattedStocks.length} stocks from Sharesansar`);
        } else {
          // Fallback to mock data if no real data
          setStocks(getMockStocks());
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load stock data:', err);
        setStocks(getMockStocks());
        setError(null); // Don't show error, use mock data
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Subscribe to real-time updates
    unsubscribeRef.current = subscribeMarket((marketData, isMarketOpen) => {
      const sharesansarData = marketData?._raw?.sources?.sharesansar?.liveTrading?.data;
      if (sharesansarData && sharesansarData.length > 0) {
        const updatedStocks = transformStockData(sharesansarData);
        setStocks(updatedStocks);
      }
    });
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Mock data fallback (only used if API completely fails)
  const getMockStocks = () => {
    const mockData = [
      { symbol: "NABIL", price: 850.00, change: 40.00, changePercent: 4.94 },
      { symbol: "ADBL", price: 620.00, change: 18.50, changePercent: 3.07 },
      { symbol: "NTC", price: 890.00, change: -12.00, changePercent: -1.33 },
      { symbol: "SHPC", price: 448.20, change: -8.80, changePercent: -1.93 },
      { symbol: "NLIC", price: 1817.00, change: 7.00, changePercent: 0.39 },
      { symbol: "PPL", price: 343.00, change: 4.00, changePercent: 1.18 },
    ];
    
    return mockData.map(stock => ({
      ...stock,
      name: stock.symbol,
      logo: getStockLogo(stock.symbol),
    }));
  };

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(5);
      } else {
        setItemsPerView(7);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (stocks.length === 0 || loading) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= stocks.length * 2) {
          return 0;
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [stocks.length, loading]);

  // Handle seamless reset
  useEffect(() => {
    if (currentIndex < stocks.length * 2 || stocks.length === 0) return;

    const resetTimeout = setTimeout(() => {
      setIsTransitioning(false);
      setCurrentIndex(0);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    }, 0);

    return () => clearTimeout(resetTimeout);
  }, [currentIndex, stocks.length]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading market data...</span>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        No stock data available at the moment
      </div>
    );
  }

  // Create infinite loop list
  const infiniteList = [...stocks, ...stocks, ...stocks];

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
      <div className="overflow-hidden relative">
        <div
          ref={carouselRef}
          className="flex gap-3 sm:gap-4 md:gap-6"
          style={{
            transform: `translateX(-${(currentIndex * (100 / itemsPerView))}%)`,
            transition: isTransitioning ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {infiniteList.map((stock, idx) => (
            <div
              key={`${stock.symbol}-${idx}`}
              style={{ 
                minWidth: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (24 / itemsPerView)}px)` 
              }}
              className="sm:p-3 md:p-4 bg-white rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-500 flex flex-col items-center cursor-pointer hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
              onClick={() => {
                window.location.href = `/stock/${stock.symbol}`;
              }}
            >
              <div className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 transform transition-transform duration-300 hover:scale-110">
                {stock.logo}
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-1">
                {stock.symbol}
              </h3>

              <div className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-2 sm:mb-3">
                Rs. {formatPrice(stock.price)}
              </div>

              <div
                className={`text-xs sm:text-sm flex items-center gap-1 font-semibold transition-colors duration-300 ${
                  stock.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-300 hover:scale-110" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-300 hover:scale-110" />
                )}

                <span className="whitespace-nowrap">
                  {stock.change >= 0 ? "+" : ""}
                  {formatPrice(Math.abs(stock.change))} 
                  ({stock.changePercent >= 0 ? "+" : ""}
                  {formatChangePercent(stock.changePercent)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smoother edges */}
        <div className="absolute left-0 top-0 w-8 sm:w-12 md:w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 w-8 sm:w-12 md:w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default Carousel;