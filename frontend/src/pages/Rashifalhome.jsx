import React from 'react'
import Rashifal from '../components/News/Rashifal'
import AdSlot from '../components/ads/AdSlot'

function Rashifalhome() {
  return (
    <div>
      <AdSlot position="hero_banner" className="mb-6" />
      <Rashifal />
    </div>
  )
}

export default Rashifalhome
