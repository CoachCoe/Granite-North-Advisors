// Generates the favicon set and the Open Graph image into public/.
// Outputs are committed; rerun only if the mark or wordmark changes.
// The OG image needs real Archivo glyphs, which librsvg can't load, so it is
// rendered by headless Chrome (set CHROME_PATH if it isn't in the default spot).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = join(root, 'public');
const ground = '#F4F5F2';
const accent = '#1F5C4A';
const ink = '#16201C';

const markPaths = `<path d="M3 29 L13 11 L19 21 L23 15 L31 29 Z" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round" fill="none"/><path d="M13 11 L16 16" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>`;

// Mark on a rounded ground tile so it stays visible on dark browser tabs.
const tile = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><rect width="34" height="34" rx="${radius}" fill="${ground}"/><g transform="translate(0 -3)">${markPaths}</g></svg>`;

writeFileSync(join(pub, 'favicon.svg'), tile(7));

const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

const ico32 = await png(tile(7), 32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, ico32]));

// Touch icons get square corners; the platform applies its own mask.
writeFileSync(join(pub, 'apple-touch-icon.png'), await png(tile(0), 180));
writeFileSync(join(pub, 'icon-192.png'), await png(tile(0), 192));
writeFileSync(join(pub, 'icon-512.png'), await png(tile(0), 512));

writeFileSync(
  join(pub, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Granite North Advisors',
      short_name: 'Granite North',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', },
      ],
      theme_color: ground,
      background_color: ground,
      display: 'browser',
    },
    null,
    2,
  ) + '\n',
);

const font = (pkg, file) =>
  readFileSync(join(root, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64');

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Archivo;font-weight:800;src:url(data:font/woff2;base64,${font('archivo', 'archivo-latin-800-normal.woff2')}) format('woff2')}
@font-face{font-family:'Source Sans 3';font-weight:600;src:url(data:font/woff2;base64,${font('source-sans-3', 'source-sans-3-latin-600-normal.woff2')}) format('woff2')}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${ground}}
.wrap{box-sizing:border-box;height:630px;padding:0 96px;display:flex;flex-direction:column;justify-content:center;border-bottom:12px solid ${accent}}
.brand{display:flex;align-items:center;gap:28px}
.word{font-family:Archivo;font-weight:800;font-size:64px;letter-spacing:-0.015em;color:${ink};line-height:1}
.tag{margin:44px 0 0;font-family:'Source Sans 3';font-weight:600;font-size:32px;line-height:1.3;color:#3E4944;max-width:1008px}
</style></head><body><div class="wrap"><div class="brand">
<svg width="96" height="96" viewBox="0 0 34 34">${markPaths}</svg>
<span class="word">Granite North Advisors</span></div>
<p class="tag">Healthcare tech, billing and security help for rural NH practices</p>
</div></body></html>`;

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = mkdtempSync(join(tmpdir(), 'og-'));
const htmlPath = join(dir, 'og.html');
const shotPath = join(dir, 'og.png');
writeFileSync(htmlPath, ogHtml);
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  `--screenshot=${shotPath}`,
  `file://${htmlPath}`,
], { stdio: 'ignore' });
await sharp(shotPath).resize(1200, 630).png({ compressionLevel: 9, palette: true }).toFile(join(pub, 'og.png'));

console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png, site.webmanifest, og.png');
