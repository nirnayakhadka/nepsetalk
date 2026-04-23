import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { getNews, getImageUrl } from '../../services/adminApi';
import { Link } from 'react-router-dom';
import AdSlot from '../ads/AdSlot';
import { getTodayDate, getDaysInBsMonth } from '../../services/dateApi';

// Convert a number to Nepali unicode digits
const toNepaliDigits = (n) => {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(n).split('').map(d => digits[+d] ?? d).join('');
};

const BS_MONTH_NAMES_NP = [
  '', 'बैशाख', 'जेठ', 'असार', 'श्रावण',
  'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर',
  'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
];

const WEEKDAY_HEADERS_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

/**
 * Build a 6-row × 7-col grid for a given BS year/month.
 * Returns an array of 6 weeks, each an array of 7 day numbers (or null for empty).
 * Also returns the AD month range string like "Nov / Dec 2025".
 */
function buildCalendarGrid(bsYear, bsMonth, totalDays, firstDayOfWeek) {
  // firstDayOfWeek: 0=Sun,1=Mon,...,6=Sat  (Nepali week starts Sunday)
  const grid = [];
  let day = 1;

  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = week * 7 + col;
      if (cellIndex < firstDayOfWeek || day > totalDays) {
        row.push(null);
      } else {
        row.push(day++);
      }
    }
    grid.push(row);
  }

  return grid;
}

// Calendar Cell Component
const CalendarCell = ({ day, isToday, isSunday, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (day === null) {
    return <div className="py-2.5 text-sm text-transparent select-none">०</div>;
  }

  const nepaliDay = toNepaliDigits(day);
  
  return (
    <div
      onClick={() => onClick?.(day)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative py-2.5 text-sm font-medium rounded-lg
        transition-all duration-200 ease-in-out cursor-pointer
        ${isToday 
          ? 'bg-gradient-to-br from-white to-indigo-50 text-indigo-700 font-bold shadow-lg scale-105 ring-2 ring-indigo-300' 
          : isSunday 
            ? 'text-red-300 hover:bg-white/15' 
            : 'text-white/90 hover:bg-white/15'
        }
        ${isHovered && !isToday ? 'transform scale-105' : ''}
      `}
    >
      <span className="relative z-10">{nepaliDay}</span>
      {isToday && (
        <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse" />
      )}
    </div>
  );
};

// Month Navigator Component
const MonthNavigator = ({ month, year, adMonthRange, onPrev, onNext, isLoading }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-300" />
          <h2 className="text-xl font-bold tracking-wide">नेपाली क्यालेन्डर</h2>
        </div>
        <div>
          <p className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            {BS_MONTH_NAMES_NP[month]} {toNepaliDigits(year)}
          </p>
          <p className="text-sm text-indigo-200 mt-1">
            {adMonthRange}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 
                     hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 
                     hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm group"
        >
          <ChevronRight className="w-5 h-5 group-hover:transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// Loading Skeleton
const CalendarSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-2xl p-6 text-white">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-white/20 rounded-lg"></div>
            <div className="h-8 w-40 bg-white/20 rounded-lg"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-white/20 rounded-xl"></div>
            <div className="h-10 w-10 bg-white/20 rounded-xl"></div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 bg-white/10 rounded-lg"></div>
          ))}
          {[...Array(42)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function NepaliNewsPage() {
  const [featuredNews, setFeaturedNews] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [calendarData, setCalendarData] = useState(null);
  const [calLoading, setCalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // ─── Fetch news ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews('?limit=10');
        if (data.length > 0) {
          setFeaturedNews(data[0]);
          setNewsItems(data.slice(1, 5));
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // ─── Fetch today's BS date and build calendar ─────────────────────────────
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const { bs, ad } = await getTodayDate();

        // Get total days in this BS month
        const totalDays = await getDaysInBsMonth(bs.year, bs.month);

        // Find the day-of-week for the 1st of this BS month
        const firstAdDate = new Date(ad.year, ad.month - 1, ad.day);
        firstAdDate.setDate(firstAdDate.getDate() - (bs.day - 1));
        const firstDayOfWeek = firstAdDate.getDay();

        const grid = buildCalendarGrid(bs.year, bs.month, totalDays, firstDayOfWeek);

        // Build the AD month range string
        const lastAdDate = new Date(firstAdDate);
        lastAdDate.setDate(lastAdDate.getDate() + totalDays - 1);
        const fmt = (d) => d.toLocaleString('en', { month: 'short' });
        const adMonthRange =
          firstAdDate.getMonth() === lastAdDate.getMonth()
            ? `${fmt(firstAdDate)} ${firstAdDate.getFullYear()}`
            : `${fmt(firstAdDate)} / ${fmt(lastAdDate)} ${lastAdDate.getFullYear()}`;

        setCalendarData({
          bsYear: bs.year,
          bsMonth: bs.month,
          totalDays,
          grid,
          todayBsDay: bs.day,
          adMonthRange,
        });
      } catch (err) {
        console.error('Error loading calendar:', err);
      } finally {
        setCalLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // ─── Navigate BS months ───────────────────────────────────────────────────
  const navigateMonth = async (direction) => {
    if (!calendarData || isNavigating) return;
    
    setIsNavigating(true);
    
    let { bsYear, bsMonth } = calendarData;

    bsMonth += direction;
    if (bsMonth > 12) { bsMonth = 1; bsYear++; }
    if (bsMonth < 1) { bsMonth = 12; bsYear--; }

    try {
      const totalDays = await getDaysInBsMonth(bsYear, bsMonth);

      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/date/bs-to-ad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: bsYear, month: bsMonth, day: 1 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const firstAdDate = new Date(data.output.year, data.output.month - 1, data.output.day);
      const firstDayOfWeek = firstAdDate.getDay();

      const grid = buildCalendarGrid(bsYear, bsMonth, totalDays, firstDayOfWeek);

      const lastAdDate = new Date(firstAdDate);
      lastAdDate.setDate(lastAdDate.getDate() + totalDays - 1);
      const fmt = (d) => d.toLocaleString('en', { month: 'short' });
      const adMonthRange =
        firstAdDate.getMonth() === lastAdDate.getMonth()
          ? `${fmt(firstAdDate)} ${firstAdDate.getFullYear()}`
          : `${fmt(firstAdDate)} / ${fmt(lastAdDate)} ${lastAdDate.getFullYear()}`;

      // Add a small delay for smoother transition
      await new Promise(resolve => setTimeout(resolve, 300));

      setCalendarData(prev => ({
        ...prev,
        bsYear,
        bsMonth,
        totalDays,
        grid,
        todayBsDay: null,
        adMonthRange,
      }));
    } catch (err) {
      console.error('Error navigating month:', err);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleDayClick = (day) => {
    // Optional: Add functionality for clicking on specific days
    console.log(`Day ${day} clicked`);
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="px-4 py-8 bg-gray-100 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">समाचार लोड हुँदैछ...</p>
        </div>
      </section>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 text-xl sm:text-2xl lg:text-3xl font-bold my-4 sm:my-5">
        <h1 className="text-gray-600">Update 24 hours News</h1>
      </div>

      <div className="h-auto bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Left - Featured Article */}
            <div className="col-span-1">
              {featuredNews ? (
                <Link to={`/news/${featuredNews.id}`} className="block h-full group">
                  <div className="relative rounded-xl overflow-hidden shadow-lg h-[300px] sm:h-[400px] lg:h-full transition-transform duration-300 group-hover:scale-[1.02]">
                    {getImageUrl(featuredNews.image) ? (
                      <img
                        src={getImageUrl(featuredNews.image)}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                      <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-2">
                        {featuredNews.category_name || 'समाचार'}
                      </span>
                      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-4 leading-tight">
                        {featuredNews.title}
                      </h1>
                      <div className="flex items-center text-xs sm:text-sm text-white/80">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(featuredNews.created_at).toLocaleDateString('ne')}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl bg-slate-200 h-[300px] flex items-center justify-center">
                  <p className="text-slate-500">कुनै समाचार छैन</p>
                </div>
              )}
            </div>

            {/* Middle - News List */}
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-shadow hover:shadow-lg">
                {newsItems.length > 0 ? newsItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/news/${item.id}`}
                    className="flex gap-2 sm:gap-3 p-3 sm:p-4 border-b last:border-b-0 border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="w-20 h-16 sm:w-28 sm:h-20 lg:w-32 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                      {getImageUrl(item.image) ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 mb-1 sm:mb-2 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(item.created_at).toLocaleDateString('ne')}
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-8 text-center text-gray-400">कुनै समाचार छैन</div>
                )}

                <button className="w-full mt-4 sm:mt-7 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-2 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-lg">
                  <RotateCcw className="w-4 h-4" />
                  २४ घण्टाका ताजा अपडेट
                </button>
              </div>
            </div>

            {/* Right - Calendar and Ad */}
            <div className="col-span-1 space-y-4">
              <AdSlot position="sidebar" className="h-[180px] rounded-xl overflow-hidden shadow-md" style={{ minHeight: '180px' }} />

              {/* Calendar */}
              {calLoading || !calendarData ? (
                <CalendarSkeleton />
              ) : (
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl shadow-2xl p-6 text-white transition-all duration-300">
                  <MonthNavigator
                    month={calendarData.bsMonth}
                    year={calendarData.bsYear}
                    adMonthRange={calendarData.adMonthRange}
                    onPrev={() => navigateMonth(-1)}
                    onNext={() => navigateMonth(1)}
                    isLoading={isNavigating}
                  />

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAY_HEADERS_NP.map((day, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-semibold py-2 text-indigo-200">
                          {day}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid with animation */}
                  <div 
                    className={`grid grid-cols-7 gap-1 transition-opacity duration-300 ${
                      isNavigating ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    {calendarData.grid.map((week, weekIdx) =>
                      week.map((day, dayIdx) => {
                        const isToday = day !== null && day === calendarData.todayBsDay;
                        const isSunday = dayIdx === 0;

                        return (
                          <CalendarCell
                            key={`${weekIdx}-${dayIdx}`}
                            day={day}
                            isToday={isToday}
                            isSunday={isSunday}
                            onClick={handleDayClick}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}