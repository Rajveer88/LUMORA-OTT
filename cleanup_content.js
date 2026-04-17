import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/content.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find 'moods: [...],' including multi-line
const regex = /moods:\s*\[[\s\S]*?\],\n?/g;
const cleanedContent = content.replace(regex, '');

fs.writeFileSync(filePath, cleanedContent);
console.log('Successfully cleaned moods from content.ts');
