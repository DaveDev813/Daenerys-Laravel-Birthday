import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const staticPages = ['invite'];
const distDir = 'dist/spa';
const sourceHtml = join(distDir, 'index.html');

for (const page of staticPages) {
  const destinationHtml = join(distDir, page, 'index.html');
  const cleanUrlHtml = join(distDir, `${page}.html`);

  mkdirSync(dirname(destinationHtml), { recursive: true });
  copyFileSync(sourceHtml, destinationHtml);
  copyFileSync(sourceHtml, cleanUrlHtml);
}
