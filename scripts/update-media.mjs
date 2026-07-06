/**
 * Regenerates presskit/data/media.json from the public Google Drive folders.
 * Requires GDRIVE_API_KEY in the environment (repo secret in CI).
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const API_KEY = process.env.GDRIVE_API_KEY;
if (!API_KEY) {
  console.error('GDRIVE_API_KEY missing');
  process.exit(1);
}

const PICS_FOLDER = '1nnX8xoSkymsBFSVrJNhRdllV_52Qi9CL';
const VIDEO_FOLDER = '1emmY1QImIHTU3obW9gDP5shPqu4095gl';
const ROOT_FOLDER = '1GHp8n7GeKfABJrbLH7_sADhne01bm8Xc';
const OUT = 'presskit/data/media.json';

const API = 'https://www.googleapis.com/drive/v3/files';
const FIELDS = 'nextPageToken,files(id,name,mimeType,createdTime)';

async function listFolder(folderId) {
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      key: API_KEY,
      fields: FIELDS,
      pageSize: '1000',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) {
      throw new Error(`Drive API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  return files;
}

async function collectVideos(folderId, folderName = '') {
  const entries = await listFolder(folderId);
  const videos = [];
  for (const f of entries) {
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      videos.push(...(await collectVideos(f.id, f.name)));
    } else if (f.mimeType.startsWith('video/')) {
      videos.push({ id: f.id, name: f.name, folder: folderName, createdTime: f.createdTime });
    }
  }
  return videos;
}

const byNewest = (a, b) => b.createdTime.localeCompare(a.createdTime);

const photos = (await listFolder(PICS_FOLDER))
  .filter((f) => f.mimeType.startsWith('image/'))
  .map((f) => ({ id: f.id, name: f.name, createdTime: f.createdTime }))
  .sort(byNewest);

const videos = (await collectVideos(VIDEO_FOLDER)).sort(byNewest);

// loose videos in the root folder (e.g. the press kit video itself)
const rootVideos = (await listFolder(ROOT_FOLDER))
  .filter((f) => f.mimeType.startsWith('video/'))
  .map((f) => ({ id: f.id, name: f.name, folder: '', createdTime: f.createdTime }));
videos.push(...rootVideos);
videos.sort(byNewest);

const next = { generatedAt: new Date().toISOString(), photos, videos };

// avoid churn: compare everything except the timestamp
if (existsSync(OUT)) {
  const prev = JSON.parse(readFileSync(OUT, 'utf8'));
  const strip = (o) => JSON.stringify({ photos: o.photos, videos: o.videos });
  if (strip(prev) === strip(next)) {
    console.log('media.json unchanged, skipping write');
    process.exit(0);
  }
}

writeFileSync(OUT, JSON.stringify(next, null, 2) + '\n');
console.log(`media.json updated: ${photos.length} photos, ${videos.length} videos`);
