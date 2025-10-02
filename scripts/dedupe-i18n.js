// Deduplicate duplicate keys inside translation objects in src/lib/i18n.ts
// Keeps the first occurrence of a key within each translation block (en/es)
// Usage: node scripts/dedupe-i18n.js

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'lib', 'i18n.ts');

function dedupeI18n(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/);

  let output = [];
  let inTranslation = false;
  let braceDepth = 0;
  let seenKeys = new Set();

  const keyRegex = /^\s*([a-zA-Z0-9_]+)\s*:\s*"[\s\S]*?",\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of a translation block
    if (!inTranslation && /translation:\s*\{\s*$/.test(line)) {
      inTranslation = true;
      braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      seenKeys.clear();
      output.push(line);
      continue;
    }

    if (inTranslation) {
      // Update depth before processing removal to handle one-line closing
      const openCount = (line.match(/\{/g) || []).length;
      const closeCount = (line.match(/\}/g) || []).length;

      // Try to match a simple key: "value", line only when inside translation object
      const m = line.match(keyRegex);
      if (m) {
        const key = m[1];
        if (seenKeys.has(key)) {
          // Drop duplicate line
          continue;
        } else {
          seenKeys.add(key);
        }
      }

      braceDepth += openCount - closeCount;
      if (braceDepth <= 0) {
        inTranslation = false;
      }

      output.push(line);
      continue;
    }

    output.push(line);
  }

  const result = output.join('\n');
  if (result !== src) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log('i18n.ts deduplicated successfully');
  } else {
    console.log('No changes made - no duplicates detected');
  }
}

dedupeI18n(target);


