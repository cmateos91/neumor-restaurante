import fs from 'node:fs';
import path from 'node:path';

function loadJson(relPath) {
  const full = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function main() {
  const issues = [];

  const nav = loadJson('docs/navigation.json');
  if (!Array.isArray(nav.tabs)) {
    issues.push({ type: 'error', message: 'navigation.json tabs missing or invalid' });
  }

  const pageLayout = loadJson('docs/page-layout.json');
  if (!Array.isArray(pageLayout.homeLayout)) {
    issues.push({ type: 'error', message: 'page-layout.json homeLayout missing or invalid' });
  } else {
    pageLayout.homeLayout.forEach((sec) => {
      if (!sec.id || !sec.type) {
        issues.push({ type: 'error', message: `homeLayout section missing id/type: ${JSON.stringify(sec)}` });
      }
    });
  }

  const forms = loadJson('docs/forms-map.json');
  Object.entries(forms).forEach(([section, fields]) => {
    if (!Array.isArray(fields) || fields.length === 0) {
      issues.push({ type: 'warning', message: `forms-map for ${section} is empty` });
    }
  });

  const editableMap = loadJson('docs/editable-map.json');
  const ids = new Set();
  editableMap.forEach((entry) => {
    if (ids.has(entry.elementId)) {
      issues.push({ type: 'error', message: `Duplicated elementId in editable-map: ${entry.elementId}` });
    }
    ids.add(entry.elementId);
  });

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  warnings.forEach(w => console.warn(`⚠️  ${w.message}`));
  errors.forEach(e => console.error(`❌ ${e.message}`));

  if (errors.length > 0) {
    process.exit(1);
  } else {
    console.log('✅ schema docs validated (navigation/forms/layout/editables)');
  }
}

main();
