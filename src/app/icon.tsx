import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7DF9FF',
          borderRadius: 8,
          fontWeight: 'bold',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 17a4 4 0 0 0 8 0" />
          <path d="M9 13h6" />
          <path d="M12 3v1" />
          <path d="M18.7 5.3a2.4 2.4 0 0 0-3.4 0" />
          <path d="M5.3 5.3a2.4 2.4 0 0 1 3.4 0" />
          <path d="M21 11.5a6.5 6.5 0 0 0-11-5.2" />
          <path d="M3 11.5a6.5 6.5 0 0 1 11-5.2" />
          <path d="M3.5 17.5a2.5 2.5 0 0 0 4 0" />
          <path d="M16.5 17.5a2.5 2.5 0 0 1-4 0" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
