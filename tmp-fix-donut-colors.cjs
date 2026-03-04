const fs = require('fs');
const path = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let code = fs.readFileSync(path, 'utf8');

// Remove DONUT_COLORS from inside KpiCard function
code = code.replace(
  `
  // Donut chart colors for survey breakdown
  const DONUT_COLORS = ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7", "#f97316", "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#14b8a6", "#f43f5e"];

  return (`,
  `  return (`
);

// Add DONUT_COLORS at module level, before the COMPONENTS section
code = code.replace(
  `// ============================================================\n// COMPONENTS\n// ============================================================`,
  `// Donut chart colors for survey breakdown\nconst DONUT_COLORS = ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7", "#f97316", "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#14b8a6", "#f43f5e"];\n\n// ============================================================\n// COMPONENTS\n// ============================================================`
);

fs.writeFileSync(path, code, 'utf8');

// Verify
const updated = fs.readFileSync(path, 'utf8');
const lines = updated.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('DONUT_COLORS')) {
    console.log(`Line ${i+1}: ${lines[i].trim()}`);
  }
}
