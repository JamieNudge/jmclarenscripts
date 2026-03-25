import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const alt = "Today's Best Picks · GoalLab";

export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

/** Node: read GoalLab icon from /public when present (often gitignored locally). */
export const runtime = 'nodejs';

export default async function Image() {
  let iconSrc: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), 'public', 'images', 'goallab-icon.png'));
    iconSrc = `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    /* icon not in repo / deploy — draw fallback */
  }

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
          }}
        >
          {"Today's Best Picks"}
        </div>
        <div style={{ marginTop: 14, fontSize: 30, fontWeight: 600, color: '#a5f3fc' }}>GoalLab</div>
      </div>
    ),
    { ...size },
  );
}
