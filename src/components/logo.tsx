'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

const LogoSvgContent = ({
  idPrefix,
  className,
}: {
  idPrefix: string
  className?: string
}) => {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>InfographicAI Logo</title>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${idPrefix}-bgGradient`}
          x1="20"
          x2="220"
          y1="220"
          y2="20"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${idPrefix}-dataGradient1`}
          x1="40"
          x2="200"
          y1="200"
          y2="40"
        >
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${idPrefix}-dataGradient2`}
          x1="40"
          x2="200"
          y1="200"
          y2="40"
        >
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${idPrefix}-dataGradient3`}
          x1="40"
          x2="200"
          y1="200"
          y2="40"
        >
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient
          id={`${idPrefix}-overlayGradient`}
          x1="0"
          x2="1"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="skewY(-5)">
        <rect
          fill="#6366F1"
          height="140"
          opacity="0.3"
          rx="12"
          width="140"
          x="50"
          y="60"
        />
        <rect
          fill={`url(#${idPrefix}-bgGradient)`}
          height="160"
          rx="16"
          stroke="#34D399"
          strokeOpacity="0.3"
          strokeWidth="2"
          width="160"
          x="30"
          y="40"
        />
      </g>
      <g transform="translate(10, 10)">
        <path
          d="M45 170 V 120 C 45 115 50 110 55 110 H 75 C 80 110 85 115 85 120 V 170 C 85 175 80 180 75 180 H 55 C 50 180 45 175 45 170 Z"
          fill={`url(#${idPrefix}-dataGradient1)`}
          opacity="0.8"
        />
        <path
          d="M95 170 V 90 C 95 85 100 80 105 80 H 125 C 130 80 135 85 135 90 V 170 C 135 175 130 180 125 180 H 105 C 100 180 95 175 95 170 Z"
          fill={`url(#${idPrefix}-dataGradient2)`}
          opacity="0.9"
        />
        <path
          d="M145 170 V 60 C 145 55 150 50 155 50 H 175 C 180 50 185 55 185 60 V 170 C 185 175 180 180 175 180 H 155 C 150 180 145 175 145 170 Z"
          fill={`url(#${idPrefix}-dataGradient3)`}
        />
      </g>
      <g
        filter="drop-shadow(0px 2px 4px rgba(52, 211, 153, 0.4))"
        transform="translate(10, 10)"
      >
        <polyline
          fill="none"
          points="65 115, 115 85, 165 55"
          stroke="#6EE7B7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <circle
          cx="65"
          cy="115"
          fill="#D1FAE5"
          r="6"
          stroke="#34D399"
          strokeWidth="2"
        />
        <circle
          cx="115"
          cy="85"
          fill="#CFFAFE"
          r="6"
          stroke="#22D3EE"
          strokeWidth="2"
        />
        <circle
          cx="165"
          cy="55"
          fill="#DBEAFE"
          r="6"
          stroke="#60A5FA"
          strokeWidth="2"
        />
      </g>
      <rect
        fill={`url(#${idPrefix}-overlayGradient)`}
        height="160"
        pointerEvents="none"
        rx="16"
        transform="skewY(-5)"
        width="160"
        x="30"
        y="40"
      />
    </svg>
  )
}

export const Logo = ({
  className,
  uniColor: _uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  const id = useId()
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <LogoSvgContent className="h-6 w-6" idPrefix={id} />
      <span className="font-semibold text-lg tracking-tight">
        InfographicAI
      </span>
    </div>
  )
}

export const LogoIcon = ({ className }: { className?: string }) => {
  const id = useId()
  return <LogoSvgContent className={cn('size-5', className)} idPrefix={id} />
}

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('size-7 w-7', className)}
      fill="none"
      viewBox="0 0 71 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Logo Stroke</title>
      <path
        d="M61.25 1.625L70.75 1.5625C70.75 4.77083 70.25 7.79167 69.25 10.625C68.2917 13.4583 66.8958 15.9583 65.0625 18.125C63.2708 20.25 61.125 21.9375 58.625 23.1875C56.1667 24.3958 53.4583 25 50.5 25C46.875 25 43.6667 24.2708 40.875 22.8125C38.125 21.3542 35.125 19.2083 31.875 16.375C29.75 14.4167 27.7917 12.8958 26 11.8125C24.2083 10.7292 22.2708 10.1875 20.1875 10.1875C18.0625 10.1875 16.25 10.7083 14.75 11.75C13.25 12.75 12.0833 14.1875 11.25 16.0625C10.4583 17.9375 10.0625 20.1875 10.0625 22.8125L0 22.9375C0 19.6875 0.479167 16.6667 1.4375 13.875C2.4375 11.0833 3.83333 8.64583 5.625 6.5625C7.41667 4.47917 9.54167 2.875 12 1.75C14.5 0.583333 17.2292 0 20.1875 0C23.8542 0 27.1042 0.770833 29.9375 2.3125C32.8125 3.85417 35.7708 5.97917 38.8125 8.6875C41.1042 10.7708 43.1042 12.3333 44.8125 13.375C46.5625 14.375 48.4583 14.875 50.5 14.875C52.6667 14.875 54.5417 14.3125 56.125 13.1875C57.75 12.0625 59 10.5 59.875 8.5C60.7917 6.5 61.25 4.20833 61.25 1.625Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.5}
      />
    </svg>
  )
}
