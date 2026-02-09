import { cn } from '@/lib/utils'

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  return (
    <svg
      className={cn('h-6 w-auto text-foreground', className)}
      fill="none"
      viewBox="0 0 110 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>InfographicAI Logo</title>
      {/* Icon: Modern chart/AI symbol */}
      <g>
        {/* Chart bars representing data visualization */}
        <rect
          fill={uniColor ? 'currentColor' : 'url(#logo-gradient-icon)'}
          height="3"
          rx="0.5"
          width="2.5"
          x="0"
          y="13"
        />
        <rect
          fill={uniColor ? 'currentColor' : 'url(#logo-gradient-icon)'}
          height="5"
          rx="0.5"
          width="2.5"
          x="3.5"
          y="11"
        />
        <rect
          fill={uniColor ? 'currentColor' : 'url(#logo-gradient-icon)'}
          height="7"
          rx="0.5"
          width="2.5"
          x="7"
          y="9"
        />
        {/* AI sparkle symbol */}
        <g fill={uniColor ? 'currentColor' : 'url(#logo-gradient-icon)'}>
          <circle cx="12.5" cy="5.5" r="1.5" />
          <rect height="5" rx="0.3" width="0.6" x="12.2" y="3" />
          <rect height="0.6" rx="0.3" width="5" x="10" y="5.2" />
          <rect
            height="0.6"
            rx="0.3"
            transform="rotate(45 12.5 5.5)"
            width="2.6"
            x="11.2"
            y="3.8"
          />
          <rect
            height="0.6"
            rx="0.3"
            transform="rotate(-45 12.5 5.5)"
            width="2.6"
            x="11.2"
            y="6.6"
          />
        </g>
      </g>

      {/* Text: InfographicAI - using path for better compatibility */}
      <text
        fill="currentColor"
        fontFamily="var(--font-sans), system-ui, -apple-system, sans-serif"
        fontSize="11.5"
        fontWeight="600"
        letterSpacing="-0.02em"
        x="18"
        y="13.5"
      >
        InfographicAI
      </text>

      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="logo-gradient-icon"
          x1="0"
          x2="0"
          y1="3"
          y2="16"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  return (
    <svg
      className={cn('size-5', className)}
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>InfographicAI Icon</title>
      {/* Chart bars */}
      <rect
        fill={uniColor ? 'currentColor' : 'url(#logo-icon-gradient)'}
        height="4"
        rx="0.5"
        width="2.5"
        x="2"
        y="12"
      />
      <rect
        fill={uniColor ? 'currentColor' : 'url(#logo-icon-gradient)'}
        height="6"
        rx="0.5"
        width="2.5"
        x="5.5"
        y="10"
      />
      <rect
        fill={uniColor ? 'currentColor' : 'url(#logo-icon-gradient)'}
        height="8"
        rx="0.5"
        width="2.5"
        x="9"
        y="8"
      />
      {/* AI sparkle */}
      <g fill={uniColor ? 'currentColor' : 'url(#logo-icon-gradient)'}>
        <circle cx="13.5" cy="4.5" r="1.2" />
        <rect height="4" rx="0.3" width="0.6" x="13.2" y="2.5" />
        <rect height="0.6" rx="0.3" width="4" x="11.5" y="4.2" />
        <rect
          height="0.5"
          rx="0.25"
          transform="rotate(45 13.5 4.5)"
          width="2.6"
          x="12.2"
          y="2.8"
        />
        <rect
          height="0.5"
          rx="0.25"
          transform="rotate(-45 13.5 4.5)"
          width="2.6"
          x="12.2"
          y="5.7"
        />
      </g>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="logo-icon-gradient"
          x1="2"
          x2="2"
          y1="2.5"
          y2="16"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  )
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
