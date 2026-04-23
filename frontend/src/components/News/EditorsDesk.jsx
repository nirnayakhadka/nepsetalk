import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getNews, getImageUrl } from '../../services/adminApi.js';

const EditorsDesk = () => {
    const [featureStory, setFeatureStory] = useState(null);
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await getNews('?limit=10');
                if (data.length > 0) {
                    setFeatureStory(data[0]);
                    setNewsItems(data.slice(1));
                }
            } catch (err) {
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading || !featureStory) {
        return (
            <section className="px-4 py-8 bg-gray-50 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">समाचार लोड हुँदैछ...</p>
                </div>
            </section>
        );
    }
    return (
        <>
            <section className="px-4 py-8 bg-gray-50">
                <div className="mx-auto w-full max-w-[90%]">
                    {/* Main Grid Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Takes 2 columns on large screens */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Large Feature Card */}
                            <article className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="grid md:grid-cols-2">
                                    <div className="relative h-64 md:h-80 lg:h-96">
                                        <img
                                            src={getImageUrl(featureStory.image) || '/default.jpg'}
                                            alt={featureStory.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="bg-green-700 text-white p-6 flex flex-col justify-center">
                                        <h2 className="text-xl md:text-2xl lg:text-4xl font-bold leading-tight mb-4">
                                            {featureStory.title}
                                        </h2>
                                        <p className="text-sm md:text-base leading-relaxed opacity-95">
                                            {featureStory.excerpt || featureStory.content?.substring(0, 150) + '...'}
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* Small News Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {newsItems.map((item, index) => (
                                    <article
                                        key={index}
                                        className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="flex gap-4 p-4">
                                            <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                                                <img
                                                    src={getImageUrl(item.image) || '/default.jpg'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="flex-1 flex items-center">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                                                    {item.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Takes 1 column on large screens */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-6">
                                {/* Corporate Header */}
                                <div className="bg-orange-400 text-white px-6 py-3 rounded-t-lg">
                                    <h2 className="text-xl   font-bold">कर्पोरेट</h2>
                                </div>

                                {/* Side Stories */}
                                <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                                    {newsItems.slice(0, 6).map((story, index) => (
                                        <article
                                            key={index}
                                            className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                                                <h3 className="text-base font-semibold text-gray-800 leading-relaxed group-hover:text-blue-700 transition-colors">
                                                    {story.title}
                                                </h3>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default EditorsDesk;