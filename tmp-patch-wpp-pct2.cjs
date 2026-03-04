const fs = require('fs');
const path = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let code = fs.readFileSync(path, 'utf8');

const old = `<TableCell className={\`text-right font-medium \${row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100 >= 70 ? "text-green-400" : (row.whatsappEntries / row.leads) * 100 >= 40 ? "text-yellow-400" : "text-red-400") : "text-muted-foreground"}\`}>{row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100).toFixed(1) + "%" : "-"}</TableCell>`;

const neu = `<TableCell className={\`text-right font-medium \${row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100 >= 85 ? "text-green-400" : (row.whatsappEntries / row.leads) * 100 >= 78 ? "text-yellow-400" : "text-red-400") : "text-muted-foreground"}\`}>{row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100).toFixed(1) + "%" : "-"}</TableCell>`;

if (code.includes(old)) {
  code = code.replace(old, neu);
  fs.writeFileSync(path, code, 'utf8');
  console.log('OK - Thresholds updated: >=85 green, 78-84 yellow, <78 red');
} else {
  console.log('ERRO: trecho nao encontrado');
}
