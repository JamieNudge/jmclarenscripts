import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { normalizeBlogSlug } from '@/lib/blog-post';
import { firebaseAdminStorageBucket } from '@/lib/firebase-storage-bucket';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

function misconfigured(msg: string) {
  return NextResponse.json({ error: msg }, { status: 503 });
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) {
    return misconfigured('Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)');
  }
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bucketName = firebaseAdminStorageBucket();
  if (!bucketName) {
    return misconfigured(
      'Storage bucket not configured (set FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, or valid FIREBASE_SERVICE_ACCOUNT_JSON with project_id)',
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const slugRaw = form.get('slug');
  const file = form.get('file');
  if (typeof slugRaw !== 'string' || !slugRaw.trim()) {
    return NextResponse.json({ error: 'Form field `slug` is required' }, { status: 400 });
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Form field `file` (image) is required' }, { status: 400 });
  }

  const slug = normalizeBlogSlug(slugRaw);
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const mime = (file as File).type || 'application/octet-stream';
  if (!ALLOWED_TYPES.has(mime)) {
    return NextResponse.json(
      { error: `Unsupported type ${mime}. Allowed: ${Array.from(ALLOWED_TYPES).join(', ')}` },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` }, { status: 400 });
  }

  const ext = extForMime(mime);
  const objectPath = `blog/${slug}/${randomUUID()}.${ext}`;

  try {
    const app = getFirebaseAdminApp();
    const bucket = getStorage(app).bucket(bucketName);
    const f = bucket.file(objectPath);
    const downloadToken = randomUUID();
    await f.save(buf, {
      metadata: {
        contentType: mime,
        cacheControl: 'public, max-age=31536000',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const encoded = encodeURIComponent(objectPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${downloadToken}`;

    return NextResponse.json({ url, path: objectPath });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const bucketMissing =
      raw.includes('does not exist') ||
      raw.includes('"code": 404') ||
      raw.includes('notFound') ||
      raw.includes('No such bucket');

    if (bucketMissing) {
      return NextResponse.json(
        {
          error:
            'Firebase Storage bucket was not found. In Firebase Console open Storage and complete setup if you have not already, then copy the bucket name from Project settings (Web app storageBucket) or from the Storage files page (gs://…). Set it on the server as FIREBASE_STORAGE_BUCKET (recommended) or ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET matches exactly. New projects sometimes use YOUR_PROJECT.firebasestorage.app instead of YOUR_PROJECT.appspot.com.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
