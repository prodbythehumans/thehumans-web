/**
 * Regenerates the PNG icons in public/ and the root favicon.ico from public/favicon.svg.
 * Run after changing the logo:  npx --yes -p sharp -p png-to-ico node scripts/build-favicons.mjs
 *
 * favicon.svg recolours itself via prefers-color-scheme, but PNG and ICO cannot,
 * so they are rasterised over an opaque cream background with the logo in black.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import sharp from 'sharp';
import pngToIcoModule from 'png-to-ico';

const pngToIco = pngToIcoModule.default || pngToIcoModule;

const SVG = 'public/favicon.svg';
const BG = '#FFFDF7';
const FG = '#191919';

const PNGS = [
  ['public/favicon-16.png', 16],
  ['public/favicon-32.png', 32],
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
];
const ICO_SIZES = [16, 32, 48];

/* Strip the adaptive <style> block and bake in a solid background + fill. */
const source = Buffer.from(
  readFileSync(SVG, 'utf8')
    .replace(/<style>[\s\S]*?<\/style>/, `<rect width="512" height="512" fill="${BG}"/>`)
    .replace(/<path /g, `<path fill="${FG}" `)
);

const render = (size) =>
  sharp(source, { density: 512 }).resize(size, size).png({ compressionLevel: 9 });

for (const [out, size] of PNGS) {
  await render(size).toFile(out);
  console.log('png', out, size);
}

const buffers = await Promise.all(ICO_SIZES.map((size) => render(size).toBuffer()));
writeFileSync('favicon.ico', await pngToIco(buffers));
console.log('ico favicon.ico', ICO_SIZES.join('/'));
