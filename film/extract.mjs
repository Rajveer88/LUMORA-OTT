import { inflate } from '@sparticuz/chromium';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), 'node_modules/@sparticuz/chromium/bin');
for (const f of ['chromium.br','swiftshader.tar.br','al2023.tar.br','fonts.tar.br']) {
  const p = await inflate(join(root, f));
  console.log('INFLATED', f, '->', p);
}
