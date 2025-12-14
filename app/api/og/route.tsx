import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #4F46E5 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            zIndex: 10,
          }}
        >
          {/* Lightning Bolt Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'white',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            FedSpace
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '48px',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: '1.4',
            }}
          >
            AI-Powered Federal Contract Intelligence
          </div>

          {/* Feature Pills */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
              }}
            >
              📄 Government Contracts
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
              }}
            >
              🏢 Real Estate
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
              }}
            >
              📊 Analytics
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
