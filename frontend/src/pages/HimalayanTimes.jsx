import React, { useState } from 'react';
import { Clock, MessageSquare, Eye, TrendingUp, Play } from 'lucide-react';
import { getImageUrl } from '../services/adminApi';
import AdSlot from '../components/ads/AdSlot';

const NewsComponents = () => {
  const [activeTab, setActiveTab] = useState('latest');

  const newsData = {
    mainStory: {
      id: 1,
      title: "प्रधानमन्त्रीले बोलाए सर्वदलीय बैठक",
      excerpt: "२४ भदौ, काठमाडौं । प्रधानमन्त्री केपी शर्मा ओलीले सर्वदलीय बैठक आव्हान गरेका छन्...",
      image: getImageUrl("https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&h=500&fit=crop"),
      time: "२ घण्टा अगाडि",
      comments: 245
    },
    sideStories: [
      { id: 2, title: "बालकोटमा गोली चल्यो, २ जना घाइते", time: "३ घण्टा अगाडि", comments: 156 },
      { id: 3, title: "रास्वपाका सबै सांसदले राजीनामा दिने", time: "४ घण्टा अगाडि", comments: 89 },
      { id: 4, title: "खानेपानीमन्त्री यादवले दिए राजीनामा", time: "५ घण्टा अगाडि", comments: 67 },
      { id: 5, title: "बानेश्वर क्षेत्र तनावग्रस्त, सडक प्रदर्शनकारीको कब्जामा", time: "६ घण्टा अगाडि", comments: 134 }
    ],
    liveUpdate: {
      id: 6,
      title: "LIVE Updates: जेन-जी आन्दोलनको दोस्रो दिन, कहाँ के भइरहेछ ?",
      time: "२ घण्टा अगाडि",
      badge: "Live Updates"
    },
    imageGrid: [
      { id: 7, title: "नेपाली कांग्रेस कार्यालयमा आगजनी (तस्वीरहरू)", image: getImageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"), time: "१ घण्टा अगाडि", comments: 89 },
      { id: 8, title: "एमालेको केन्द्रीय कार्यालयमा आगजनी (तस्वीरहरू)", image: getImageUrl("https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=300&fit=crop"), time: "२ घण्टा अगाडि", comments: 123 },
      { id: 9, title: "कांग्रेस सभापति देउवाको निवासमा आगजनी (लाइभ)", image: getImageUrl("https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&h=300&fit=crop"), time: "३ घण्टा अगाडि", comments: 267 },
      { id: 10, title: "धनगढीस्थित परराष्ट्रमन्त्री आरजुको घरमा आगजनी", image: getImageUrl("https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop"), time: "४ घण्टा अगाडि", comments: 156 }
    ],
    trending: [
      { id: 11, title: "रुबी म्याडम", excerpt: "मानिसको स्पर्शको अभावमा भावना पग्लन सक्दो रहेनछ । सँधै एक्लो, सबैतिर एक्लो भएर बाँच्नु कठिन रहेछ ।", views: "45.2k" },
      { id: 12, title: "सिभिल अस्पतालको इमर्जेन्सी : मुटु हल्लाउने त्यो दृश्य", excerpt: "उनलाई तत्काल इमर्जेन्सीको रेड जोनमा भित्र छिराइयो । एकैछिनमा उनका साथीहरू रुन थाले ।", views: "32.8k" }
    ],
    videoStories: [
      { id: 13, title: "प्रदर्शनकारीले आगजनी गरेको घटनास्थलबाट प्रत्यक्ष", image: getImageUrl("https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=350&h=200&fit=crop"), duration: "8:45", views: "125k" },
      { id: 14, title: "विशेष साक्षात्कार: राजनीतिक विश्लेषक", image: getImageUrl("https://images.unsplash.com/photo-1495020689067-958852a7765e?w=350&h=200&fit=crop"), duration: "15:20", views: "89k" }
    ],
    listNews: [
      { id: 15, title: "तारकेश्वरमा प्रहरी चौकी र वडा कार्यालयमा आगजनी", time: "४ घण्टा अगाडि", comments: 78 },
      { id: 16, title: "झापामा गोली चल्यो, दुई जना गम्भीर घाइते", time: "५ घण्टा अगाडि", comments: 92 },
      { id: 17, title: "गगन थापाको घर अगाडि ढुंगामुढा", time: "६ घण्टा अगाडि", comments: 145 },
      { id: 18, title: "रमेश लेखकको घरमा आगजनी", time: "७ घण्टा अगाडि", comments: 189 },
      { id: 19, title: "भारतले भन्यो- नेपालमा विकसित घटनाक्रम नजिकबाट हेरिरहेका छौं", time: "८ घण्टा अगाडि", comments: 234 }
    ]
  };

  return (
    <div className="max-w-[90%] p-2 sm:p-4 mx-auto space-y-4 sm:space-y-6">
      <AdSlot position="hero_banner" className="mb-6" />
      {/* Main Story with Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Main Featured Story */}
        <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={getImageUrl("https://images.unsplash.com/photo-1503694978374-8a2fa686963a?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
              alt={newsData.mainStory.title}
              className="w-full h-48 sm:h-64 lg:h-80 object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">ब्रेकिंग</span>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
              {newsData.mainStory.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              {newsData.mainStory.excerpt}
            </p>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="mr-4">{newsData.mainStory.time}</span>
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{newsData.mainStory.comments}</span>
            </div>
          </div>
        </div>

        {/* Side Stories List */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600">ताजा समाचार</h3>
          <div className="space-y-4">
            {newsData.sideStories.map((story) => (
              <div key={story.id} className="pb-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-2 -m-2 rounded cursor-pointer">
                <h4 className="font-semibold text-gray-900 mb-2 leading-snug hover:text-blue-600">
                  {story.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="mr-3">{story.time}</span>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  <span>{story.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Update Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded mr-3 animate-pulse">LIVE</span>
            <div>
              <h3 className="text-lg font-bold">{newsData.liveUpdate.title}</h3>
              <p className="text-sm text-red-100 mt-1">{newsData.liveUpdate.time}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Image Grid - 4 Column */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {newsData.imageGrid.map((item) => (
          <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-sm text-gray-900 mb-2 leading-tight group-hover:text-blue-600 line-clamp-2">
                {item.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span className="mr-2">{item.time}</span>
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>{item.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Section */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex items-center mb-4 pb-3 border-b-2 border-red-600">
          <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">ट्रेन्डिङ</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsData.trending.map((item, index) => (
            <div key={item.id} className="flex items-start space-x-4 cursor-pointer group">
              <div className="text-3xl font-bold text-gray-300 group-hover:text-red-600 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm mb-2 leading-relaxed line-clamp-2">
                  {item.excerpt}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Eye className="w-3 h-3 mr-1" />
                  <span>{item.views} पढाइ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-red-600">भिडियो समाचार</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {newsData.videoStories.map((video) => (
            <div key={video.id} className="group cursor-pointer">
              <div className="relative rounded-lg overflow-hidden mb-3">
                <img
                  src={video.image}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-red-600 ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                {video.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                <span>{video.views} पटक हेरिएको</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact List View */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-red-600">थप समाचार</h3>
        <div className="space-y-3">
          {newsData.listNews.map((item) => (
            <div
              key={item.id}
              className="flex items-start py-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 -mx-5 px-5 cursor-pointer group"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                  {item.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="mr-3">{item.time}</span>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisement Banner 1 */}
      <div className="relative w-full overflow-hidden">
        <img
          src="https://www.brafton.com/wp-content/uploads/2024/04/types-of-banner-hero.png"
          alt="Ad Banner"
          className="w-full h-[245px]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
          <h3 className="text-2xl font-bold mb-2">तपाईंको विज्ञापन यहाँ</h3>
          <p className="mb-4">प्रिमियम विज्ञापन स्थान - 728x90</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50">
            सम्पर्क गर्नुहोस्
          </button>
        </div>
      </div>


      {/* Tab Content Section with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Tab Content - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['latest', 'popular', 'opinion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 font-semibold text-sm ${activeTab === tab
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {tab === 'latest' && 'ताजा'}
                {tab === 'popular' && 'लोकप्रिय'}
                {tab === 'opinion' && 'विचार'}
              </button>
            ))}
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="flex space-x-4 pb-4 border-b border-gray-200 last:border-0 cursor-pointer group">
                  <img
                    src={`https://plus.unsplash.com/premium_photo-1691223733678-095fee90a0a7?q=80&w=1221&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                    alt="News"
                    className="w-28 h-20 object-cover rounded flex-shrink-0 group-hover:opacity-90"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                      यहाँ समाचारको शीर्षक आउनेछ जुन धेरै रोचक छ
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="mr-3">{item} घण्टा अगाडि</span>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      <span>{45 + item * 10}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 column */}
        <div className="space-y-4">
          {/* Advertisement Banner - Square */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white text-center shadow-md">
            <div className="text-4xl mb-3">📢</div>
            <h4 className="text-lg font-bold mb-2">विज्ञापन स्थान</h4>
            <p className="text-sm text-green-100">300x250</p>
          </div>

          {/* Most Read Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600">सबैभन्दा धेरै पढिएको</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0 cursor-pointer group">
                  <span className="text-2xl font-bold text-gray-300 group-hover:text-red-600">
                    {item}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 line-clamp-2">
                      महत्वपूर्ण समाचार शीर्षक यहाँ देखिन्छ
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{25 + item * 5}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advertisement Banner - Vertical */}
          <div className="bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center shadow-md">
            <h4 className="text-lg font-bold mb-2">विज्ञापन</h4>
            <p className="text-sm text-purple-100 mb-4">160x600</p>
            <div className="text-5xl mb-3">🎯</div>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-50">
              अधिक जान्नुहोस्
            </button>
          </div>
        </div>
      </div>

      {/* More News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <img
              src={`https://images.unsplash.com/photo-1727235314154-adced9445afc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
              alt="News"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                नयाँ समाचार शीर्षक जुन धेरै रोचक र महत्वपूर्ण छ
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                यहाँ समाचारको संक्षिप्त विवरण आउनेछ जसले पाठकलाई मुख्य कुरा बुझाउँछ।
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span className="mr-3">{item + 2} घण्टा अगाडि</span>
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>{60 + item * 15}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advertisement Banner 2 - Full Width */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">प्रिमियम विज्ञापन स्थान</h3>
            <p className="text-orange-100">970x90 - उच्च दृश्यता क्षेत्र</p>
          </div>
          <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors">
            अहिले बुक गर्नुहोस्
          </button>
        </div>
      </div>

      {/* Additional News List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-red-600">राजनीति</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex space-x-3 pb-3 border-b border-gray-200 last:border-0 cursor-pointer group">
                <img
                  src={'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                  alt="News"
                  className="w-20 h-16 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 line-clamp-2">
                    राजनीतिक समाचार शीर्षक यहाँ देखिनेछ
                  </h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{item + 1} घण्टा अगाडि</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-red-600">अर्थतन्त्र</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex space-x-3 pb-3 border-b border-gray-200 last:border-0 cursor-pointer group">
                <img
                  src={`https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                  alt="News"
                  className="w-20 h-16 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-blue-600 line-clamp-2">
                    आर्थिक समाचार शीर्षक यहाँ देखिनेछ
                  </h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{item + 2} घण्टा अगाडि</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsComponents;