import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const publicDir = join(root, 'public');
const tmpDir = join(root, '.asset-tmp');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(publicDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const symbol = `
  <g fill="currentColor">
    <rect x="236" y="514" width="116" height="282" rx="34"/>
    <rect x="454" y="392" width="116" height="404" rx="34"/>
    <rect x="672" y="274" width="116" height="522" rx="34"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M759.2 224H636C617.2 224 602 239.2 602 258C602 276.8 617.2 292 636 292H678.4L563.4 407L494.6 338.2C482 325.6 461.9 324.8 448.3 336.2L240.2 510.2C225.8 522.3 223.9 543.7 236 558.1C248.1 572.5 269.5 574.4 283.9 562.3L468.2 408.1L539.4 479.4C552.7 492.7 574.3 492.7 587.5 479.4L726 340.8V383.2C726 402 741.2 417.2 760 417.2C778.8 417.2 794 402 794 383.2V258.8C794 239.6 778.4 224 759.2 224Z"/>
  </g>`;

const svg = ({ background, color = '#FFFFFF', radius = 224, circular = false }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${circular ? `<circle cx="512" cy="512" r="512" fill="${background}"/>` : `<rect width="1024" height="1024" rx="${radius}" fill="${background}"/>`}
  <g color="${color}" transform="translate(184 184) scale(0.64)">
    ${symbol}
  </g>
</svg>`;

const renderPng = (name, size, source) => {
  const tmpHtml = join(tmpDir, `${name}.html`);
  const out = join(publicDir, name);

  writeFileSync(
    tmpHtml,
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${source}</body></html>`,
  );
  execFileSync(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${size},${size}`,
      `--screenshot=${out}`,
      `file://${tmpHtml}`,
    ],
    { stdio: 'ignore' },
  );
};

const faviconSvg = svg({ background: '#2B2B2B', circular: true });
const appIconSvg = svg({ background: '#1F1F1F', radius: 224 });

[
  ['favicon-16x16.png', 16, faviconSvg],
  ['favicon-32x32.png', 32, faviconSvg],
  ['favicon-48x48.png', 48, faviconSvg],
  ['favicon-512x512.png', 512, faviconSvg],
  ['icon-192.png', 192, appIconSvg],
  ['icon-512.png', 512, appIconSvg],
  ['apple-touch-icon.png', 180, appIconSvg],
  ['app-icon.png', 1024, appIconSvg],
].forEach(([name, size, source]) => renderPng(name, size, source));

const icoEntries = ['favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png'].map((name) =>
  readFileSync(join(publicDir, name)),
);
const headerSize = 6 + icoEntries.length * 16;
let offset = headerSize;
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoEntries.length, 4);

icoEntries.forEach((entry, index) => {
  const size = [16, 32, 48][index];
  const position = 6 + index * 16;
  header.writeUInt8(size, position);
  header.writeUInt8(size, position + 1);
  header.writeUInt8(0, position + 2);
  header.writeUInt8(0, position + 3);
  header.writeUInt16LE(1, position + 4);
  header.writeUInt16LE(32, position + 6);
  header.writeUInt32LE(entry.length, position + 8);
  header.writeUInt32LE(offset, position + 12);
  offset += entry.length;
});

writeFileSync(join(publicDir, 'favicon.ico'), Buffer.concat([header, ...icoEntries]));
rmSync(tmpDir, { recursive: true, force: true });
