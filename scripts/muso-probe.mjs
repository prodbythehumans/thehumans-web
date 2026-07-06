/**
 * One-off probe: discovers the shape of the Muso.AI v4 API responses for our
 * profile so we can build the real streams integration. Writes results to
 * muso-probe-result.json (uploaded as a CI artifact). Never prints the API key.
 */
import { writeFileSync } from 'node:fs';

const KEY = process.env.MUSO_API_KEY;
const PROFILE_ID = process.env.MUSO_PROFILE_ID || '8b5d450f-f306-4f43-904b-4c5123835a07';
const BASE = 'https://api.developer.muso.ai/v4';

if (!KEY) {
  console.error('MUSO_API_KEY missing');
  process.exit(1);
}

// candidate endpoints — we probe several because the schema is undocumented
const endpoints = [
  `/profile/${PROFILE_ID}`,
  `/profile/${PROFILE_ID}/streams`,
  `/profile/${PROFILE_ID}/stats`,
  `/profile/${PROFILE_ID}/tracks`,
  `/profile/${PROFILE_ID}/analytics`,
  `/profile/${PROFILE_ID}/overview`,
];

// try both common auth header styles
const authVariants = [
  { name: 'x-api-key', headers: { 'x-api-key': KEY } },
  { name: 'Authorization Bearer', headers: { Authorization: `Bearer ${KEY}` } },
];

function trim(obj) {
  // keep the response small but structurally complete
  const s = JSON.stringify(obj);
  return s.length > 6000 ? JSON.parse(s.slice(0, 0) || '{}') && { _truncated: s.slice(0, 6000) } : obj;
}

const results = [];

for (const auth of authVariants) {
  for (const path of endpoints) {
    const url = BASE + path;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', ...auth.headers },
      });
      const text = await res.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text.slice(0, 800); }
      results.push({ auth: auth.name, path, status: res.status, body: trim(body) });
      console.log(`[${auth.name}] ${res.status} ${path}`);
    } catch (err) {
      results.push({ auth: auth.name, path, error: String(err) });
      console.log(`[${auth.name}] ERR ${path}: ${err}`);
    }
  }
}

writeFileSync('muso-probe-result.json', JSON.stringify(results, null, 2));
console.log('wrote muso-probe-result.json');
