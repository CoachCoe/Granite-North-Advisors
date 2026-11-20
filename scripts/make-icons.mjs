// Builds the favicon set, touch icons, web manifest and Open Graph image in
// public/ from the logo kit in brand/. Outputs are committed; rerun only if the
// logo changes.
//
// favicon.svg, favicon.ico and the 180px touch icon come straight from
// brand/web/. The 192/512 manifest icons are the mark on the ground color, and
// the OG image is rendered by headless Chrome (set CHROME_PATH if it isn't in
// the default spot) because it needs the real Source Sans glyphs.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = join(root, 'public');
const brand = join(root, 'brand');
const ground = '#F4F5F2';
const accent = '#1F5C4A';

copyFileSync(join(brand, 'web/favicon.svg'), join(pub, 'favicon.svg'));
copyFileSync(join(brand, 'web/favicon.ico'), join(pub, 'favicon.ico'));
copyFileSync(join(brand, 'web/apple-touch-icon-180.png'), join(pub, 'apple-touch-icon.png'));

// Manifest icons: the mark centered on the ground color with room around it.
const markSvg = readFileSync(join(brand, 'web/favicon.svg'));
async function tile(size) {
  const markSize = Math.round(size * 0.7);
  const mark = await sharp(markSvg, { density: 1200 }).resize(markSize, markSize).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: ground } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}
writeFileSync(join(pub, 'icon-192.png'), await tile(192));
writeFileSync(join(pub, 'icon-512.png'), await tile(512));

writeFileSync(
  join(pub, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Granite North Advisors',
      short_name: 'Granite North',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
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

const logoDataUri =
  'data:image/svg+xml;base64,' + readFileSync(join(brand, 'logo/gna-logo-horizontal.svg')).toString('base64');

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Source Sans 3';font-weight:600;src:url(data:font/woff2;base64,${font('source-sans-3', 'source-sans-3-latin-600-normal.woff2')}) format('woff2')}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${ground}}
.wrap{box-sizing:border-box;height:630px;padding:0 96px;display:flex;flex-direction:column;justify-content:center;border-bottom:12px solid ${accent}}
.logo{display:block;width:640px;height:auto}
.tag{margin:56px 0 0;font-family:'Source Sans 3';font-weight:600;font-size:34px;line-height:1.3;color:#3E4944;max-width:1008px}
</style></head><body><div class="wrap">
<img class="logo" src="${logoDataUri}" alt="">
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
