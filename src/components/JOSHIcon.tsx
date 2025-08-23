
import * as React from "react"

export const JOSHICon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(255,85,85)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(85,85,255)', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(85,255,85)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(255,255,85)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="rotate(10 50 50)">
      <rect x="10" y="10" width="40" height="40" rx="10" fill="url(#grad1)" />
      <rect x="50" y="10" width="40" height="40" rx="10" fill="url(#grad2)" />
      <rect x="10" y="50" width="40" height="40" rx="10" fill="url(#grad2)" />
      <rect x="50" y="50" width="40" height="40" rx="10" fill="url(#grad1)" />
    </g>
  </svg>
)
