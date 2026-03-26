import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const portfolioOgImageSize = { width: 1200, height: 630 };

export const portfolioOgImageContentType = 'image/png';

async function readHeadshotDataUrl(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'images', 'headshot.png'));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** 1200×630 for `/` — you + portfolio copy (not GoalLab; that stays on /best-picks). */
export async function portfolioOpenGraphImageResponse() {
  const photoSrc = await readHeadshotDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          gap: 44,
          background: 'linear-gradient(160deg, #111827 0%, #1a1f2e 45%, #1f2937 100%)',
        }}
      >
        {photoSrc ? (
          <div
            style={{
              display: 'flex',
              width: 280,
              height: 280,
              borderRadius: 140,
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.35)',
              flexShrink: 0,
              boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og Satori payload */}
            <img
              src={photoSrc}
              width={280}
              height={280}
              alt=""
              style={{ objectFit: 'cover', width: 280, height: 280 }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 140,
              background: 'rgba(255,255,255,0.12)',
              border: '4px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              fontWeight: 800,
              color: '#e5e7eb',
              flexShrink: 0,
            }}
          >
            JM
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            maxWidth: 720,
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: '#f9fafb',
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
            }}
          >
            {"Jamie's Portfolio"}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 24,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.4,
            }}
          >
            {
              'macOS, iOS & Android developer — real apps, built with logic, curiosity & AI-assisted development.'
            }
          </div>
        </div>
      </div>
    ),
    { ...portfolioOgImageSize },
  );
}
