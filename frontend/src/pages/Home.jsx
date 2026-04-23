import React from 'react'
import Carousel from '../components/Carousel/Carousel'
import Rashifal from '../components/News/Rashifal'
import VideoSection from '../components/News/VideoSection'
import StockCharts from '../components/Stocks/StockCharts'
import BreakingNewsTicker from '../components/News/BreakingNewsTicker'
import EditorsDesk from '../components/News/EditorsDesk'
import NewsCalender from '../components/News/NewsCalender'
import NewsletterCTA from '../components/News/NewsletterCTA'
import HeroNewsGrid from '../components/Home/HeroNewsGrid'
import NewsColumns from '../components/Home/NewsColumns'
import TrendingNews from '../components/Home/TrendingNews'
import CategoryLinks from '../components/Home/CategoryLinks'
import MoreNews from '../components/Home/MoreNews'
import OpinionSection from '../components/Home/OpinionSection'
import AdSlot from '../components/ads/AdSlot'

const Home = () => {
  return (
    <>
      <BreakingNewsTicker />
      <AdSlot position="hero_banner" className="mb-6" />
      <HeroNewsGrid />
      <CategoryLinks />
      <Carousel />
      <NewsCalender />
      <EditorsDesk />
      <NewsColumns />
      <AdSlot position="infeed" className="my-8" />
      <MoreNews />
      <VideoSection />
      <Rashifal />
      <StockCharts />
      <OpinionSection />
      <NewsletterCTA />
      <TrendingNews />
      
      {/* Popup Ad */}
      <AdSlot position="popup" />
      
    </>
  )
}

export default Home

