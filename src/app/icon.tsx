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
            <path d="M5 12V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
            <path d="M5 12H3.5a1.5 1.5 0 0 0 0 3H5" />
            <path d="M19 12h1.5a1.5 1.5 0 0 1 0 3H19" />
            <path d="M12 12v7" />
            <path d="M9 20h6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
