import React from 'react'
import adv1 from '../../../public/videos/adv1.mp4'
const Adsvideo = () => {
  return (
     <div className="w-full h-[150px] ">
      <video
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={adv1} // replace with your video URL
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default Adsvideo