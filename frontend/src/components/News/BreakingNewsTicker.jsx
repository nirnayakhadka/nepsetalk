import React, { useMemo, useState } from 'react';
import { Flame, Clock3 } from 'lucide-react';

const headlines = [
    { title: 'cabinets clears 15-point protest response plan as street rallies swell', category: 'Politics' },
    { title: 'Nepse climbs past 2000 mark on liquidity boost and hydropower rally', category: 'Markets' },
    { title: 'After TikTok ban, creators flock to local short-video app backed by telecom giants', category: 'Tech' },
    { title: 'Weather office warns of fresh winter storm tracking across Karnali & Sudurpaschim', category: 'Weather' },
    { title: 'Public transport fares to be revised next week, says transport department', category: 'City' },
    { title: 'National women’s team advances to ACC finals after thrilling super over', category: 'Sports' }
];

const BreakingNewsTicker = () => {
    const [isPaused, setIsPaused] = useState(false);

    const duplicatedHeadlines = useMemo(() => [...headlines, ...headlines], []);

    const updatedAt = useMemo(
        () =>
            new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        []
    );

    return (
        <div className="bg-slate-900 text-white border-b border-slate-800">
            <div className="mx-auto w-full max-w-[90%] flex items-center gap-3 px-2 sm:px-3 py-3">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.35em]">
                    <Flame className="w-4 h-4" />
                    Breaking
                </div>
                <div
                    className="flex-1 overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className={`ticker-track ${isPaused ? 'paused' : ''} items-center gap-8 whitespace-nowrap`}>
                        {duplicatedHeadlines.map((item, index) => (
                            <span
                                key={`${item.title}-${index}`}
                                className="text-sm flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                                <span className="text-[10px] uppercase tracking-[0.4em] text-red-200 font-semibold">
                                    {item.category}
                                </span>
                                <span className="font-medium">{item.title}</span>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
                    <Clock3 className="w-4 h-4" />
                    Updated {updatedAt}
                </div>
            </div>
        </div>
    );
};

export default BreakingNewsTicker;

