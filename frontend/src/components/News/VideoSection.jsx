import React, { useState, useEffect } from 'react';
import { X, Play, Flame, Timer, Radio } from 'lucide-react';
import { getVideos, getImageUrl } from '../../services/adminApi';

const VideoSection = () => {
    const [mainVideos,   setMainVideos]   = useState([]);
    const [upNextVideos, setUpNextVideos] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await getVideos({ status: 'active' });
                setMainVideos(data.main   || []);
                setUpNextVideos(data.upnext || []);
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const openVideo  = (video) => setSelectedVideo(video);
    const closeVideo = ()      => setSelectedVideo(null);

    const featuredVideo   = mainVideos[0];
    const smallCardVideos = mainVideos.slice(1);

    if (loading) {
        return (
            <section className="px-2 sm:px-3 lg:px-4 py-12 bg-slate-950 text-white">
                <div className="mx-auto w-full max-w-[90%] flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/60">Loading videos...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!featuredVideo) {
        return (
            <section className="px-2 sm:px-3 lg:px-4 py-12 bg-slate-950 text-white">
                <div className="mx-auto w-full max-w-[90%] flex items-center justify-center min-h-[300px]">
                    <p className="text-white/40 text-lg">No videos available</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="px-2 sm:px-3 lg:px-4 py-12 bg-slate-950 text-white">
                <div className="mx-auto w-full max-w-[90%] space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-white/60 font-semibold">Video desk</p>
                            <h2 className="text-3xl sm:text-4xl font-bold">NepseTalk Broadcast</h2>
                            <p className="text-white/70 mt-3 text-lg max-w-2xl">
                                Field dispatches, studio conversations and daily bulletins curated by the multimedia newsroom.
                            </p>
                        </div>
                        <button className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-slate-900 px-6 py-3 rounded-full hover:bg-slate-100 transition">
                            <Radio className="w-4 h-4" />
                            Watch live stream
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Featured Video */}
                            <article
                                className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
                                onClick={() => openVideo(featuredVideo)}
                            >
                                {/* BUG FIX: getImageUrl resolves /uploads/... paths to backend origin */}
                                {getImageUrl(featuredVideo.thumbnail) ? (
                                    <img
                                        src={getImageUrl(featuredVideo.thumbnail)}
                                        alt={featuredVideo.title}
                                        className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="w-full h-[420px] bg-slate-800" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-8 space-y-4">
                                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em]">
                                        {featuredVideo.category && (
                                            <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full">
                                                <Flame className="w-4 h-4" />
                                                {featuredVideo.category}
                                            </span>
                                        )}
                                        {featuredVideo.duration && (
                                            <span className="inline-flex items-center gap-2 text-white/70">
                                                <Timer className="w-4 h-4" />
                                                {featuredVideo.duration}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-semibold leading-tight">{featuredVideo.title}</h3>
                                    {featuredVideo.description && (
                                        <p className="text-white/80 text-lg max-w-3xl">{featuredVideo.description}</p>
                                    )}
                                    <div className="inline-flex items-center gap-2 bg-white text-slate-900 rounded-full px-5 py-3 font-semibold w-fit">
                                        <Play className="w-4 h-4" />
                                        Watch report
                                    </div>
                                </div>
                            </article>

                            {/* Small cards */}
                            {smallCardVideos.length > 0 && (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {smallCardVideos.map((video) => (
                                        <button
                                            key={video.id}
                                            onClick={() => openVideo(video)}
                                            className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden text-left shadow-lg hover:-translate-y-1 hover:border-indigo-400/40 transition"
                                        >
                                            <div className="relative">
                                                {getImageUrl(video.thumbnail) ? (
                                                    <img
                                                        src={getImageUrl(video.thumbnail)}
                                                        alt={video.title}
                                                        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={e => e.target.style.display = 'none'}
                                                    />
                                                ) : (
                                                    <div className="w-full h-40 bg-slate-800" />
                                                )}
                                                {video.category && (
                                                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                                                        {video.category}
                                                    </span>
                                                )}
                                                {video.duration && (
                                                    <span className="absolute bottom-2 right-2 bg-white/80 text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded">
                                                        {video.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <h4 className="text-base font-semibold line-clamp-2">{video.title}</h4>
                                                {video.description && (
                                                    <p className="text-base text-white/70 line-clamp-2">{video.description}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar — Up Next */}
                        {upNextVideos.length > 0 && (
                            <aside className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl divide-y divide-white/5 h-fit">
                                <div className="p-5 border-b border-white/10">
                                    <h3 className="text-lg font-bold">Up Next</h3>
                                </div>
                                {upNextVideos.map((video) => (
                                    <button
                                        key={video.id}
                                        onClick={() => openVideo(video)}
                                        className="w-full flex gap-4 p-4 text-left hover:bg-white/5 transition"
                                    >
                                        <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                                            {getImageUrl(video.thumbnail) && (
                                                <img
                                                    src={getImageUrl(video.thumbnail)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                    onError={e => e.target.style.display = 'none'}
                                                />
                                            )}
                                            {video.duration && (
                                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                                                    {video.duration}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            {video.category && (
                                                <p className="text-[15px] uppercase tracking-[0.3em] text-indigo-300">{video.category}</p>
                                            )}
                                            <p className="text-base font-semibold leading-snug line-clamp-2">{video.title}</p>
                                            {video.description && (
                                                <p className="text-base text-white/60 line-clamp-2">{video.description}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </aside>
                        )}
                    </div>
                </div>
            </section>

            {/* Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeVideo}
                >
                    <button onClick={closeVideo} className="absolute top-6 right-6 text-white/70 hover:text-white transition">
                        <X size={30} />
                    </button>
                    <div className="relative w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
                        <iframe
                            src={selectedVideo.url}
                            className="w-full h-full rounded-3xl shadow-2xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoSection;