import fs from 'node:fs';
import path from 'node:path';

function loadJson(relPath) {
  const full = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function main() {
  const editableMap = loadJson('docs/editable-map.json');
  const issues = [];
  const seen = new Set();

  editableMap.forEach((entry) => {
    if (seen.has(entry.elementId)) {
      issues.push({ type: 'error', message: `Duplicated elementId: ${entry.elementId}` });
    }
    seen.add(entry.elementId);
    if (!entry.tab) {
      issues.push({ type: 'error', message: `Missing tab for ${entry.elementId}` });
    }
    if (!entry.component) {
      issues.push({ type: 'warning', message: `Missing component path for ${entry.elementId}` });
    }
  });

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  warnings.forEach(w => console.warn(`⚠️  ${w.message}`));
  errors.forEach(e => console.error(`❌ ${e.message}`));

  if (errors.length > 0) {
    process.exit(1);
  } else {
    console.log('✅ editable-map validation passed');
  }
}

main();
