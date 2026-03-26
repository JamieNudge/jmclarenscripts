import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const goalLabOgImageSize = { width: 1200, height: 630 };

export const goalLabOgImageContentType = 'image/png';

export async function readGoalLabIconDataUrl(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'images', 'goallab-icon.png'));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** 1200×630 card: GoalLab icon (or GL fallback) + two text lines. Used by route `opengraph-image.tsx` files. */
export async function goalLabOpenGraphImageResponse(title: string, subtitle: string) {
  const iconSrc = await readGoalLabIconDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(155deg, #0f172a 0%, #134e4a 40%, #0e7490 100%)',
        }}
      >
        {iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/og Satori payload
          <img
            src={iconSrc}
            width={260}
            height={260}
            alt=""
            style={{ borderRadius: 56, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 56,
              background: 'rgba(34,211,238,0.25)',
              border: '4px solid rgba(103,232,249,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 110,
              fontWeight: 800,
              color: '#ecfeff',
            }}
          >
            GL
          </div>
        )}
        <div
          style={{
            marginTop: 36,
            fontSize: 52,
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            maxWidth: 1000,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 30,
            fontWeight: 600,
            color: '#a5f3fc',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...goalLabOgImageSize },
  );
}
