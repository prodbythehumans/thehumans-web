/**
 * One-off probe: discovers the shape of the Muso.AI workspace v4a API for our
 * roster/profile so we can build the real streams integration. Writes results
 * to muso-probe-result.json (uploaded as a CI artifact). Never prints the key.
 */
import { writeFileSync } from 'node:fs';

const KEY = process.env.MUSO_API_KEY;
const PROFILE_ID = process.env.MUSO_PROFILE_ID || '8b5d450f-f306-4f43-904b-4c5123835a07';
const BASE = 'https://api.muso.ai/api/c/v4a';

if (!KEY) {
  console.error('MUSO_API_KEY missing');
  process.exit(1);
}

const headers = {
  Accept: 'application/json',
  'workspace-api-key': KEY,
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const paths = [
  '/workspace/roster',
  '/workspace/analytics',
  '/workspace/streams',
  `/profile/${PROFILE_ID}`,
  `/profile/${PROFILE_ID}/streams`,
  `/profile/${PROFILE_ID}/stats`,
  `/profile/${PROFILE_ID}/analytics`,
  `/profile/${PROFILE_ID}/tracks`,
  `/artist/${PROFILE_ID}`,
  `/artist/${PROFILE_ID}/streams`,
];

const results = [];

async function probe(path) {
  const url = BASE + path;
  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 1000); }
    // cap large bodies but keep structure
    const s = JSON.stringify(body);
    if (s.length > 8000) body = { _truncated: s.slice(0, 8000) };
    results.push({ path, status: res.status, body });
    console.log(`${res.status} ${path}`);
  } catch (err) {
    results.push({ path, error: String(err) });
    console.log(`ERR ${path}: ${err}`);
  }
}

for (const p of paths) await probe(p);

writeFileSync('muso-probe-result.json', JSON.stringify(results, null, 2));
console.log('wrote muso-probe-result.json');
