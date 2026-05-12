import React from 'react'
import { useLocation } from 'react-router-dom'

export default function Shadow() {

  const location = useLocation()

  return (
    <div style={{
      position: "absolute",
      zIndex: "9",
    }}>
      <svg style={{
          mixBlendMode: "color-dodge",
          width: 500,
          height: "auto"
        }}
        viewBox="0 0 1164 831" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M852.404 0.000448161C1119.35 315.577 1235.69 620.258 1117.52 758.502C963.421 938.775 467.698 769.179 -0.000322897 379.811L-0.000255846 0.000409813L852.404 0.000448161Z" fill="url(#paint0_radial_1165_429)" fill-opacity="0.1"/>
        <defs>
          <radialGradient id="paint0_radial_1165_429" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(255.224 21.4169) rotate(40.5237) scale(1134.39 438.516)">
            <stop stop-color="white"/>
            <stop offset="1" stop-color="white" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}
