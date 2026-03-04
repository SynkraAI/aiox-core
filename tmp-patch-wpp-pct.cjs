const fs = require('fs');
const path = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add header column: "% Grupo Wpp" after "Grupo Wpp"
const headerOld = `<TableHead className="text-xs text-right">Grupo Wpp</TableHead>`;
const headerNew = `<TableHead className="text-xs text-right">Grupo Wpp</TableHead>
                    <TableHead className="text-xs text-right">% Grupo Wpp</TableHead>`;
code = code.replace(headerOld, headerNew);

// 2. Add data cell after the whatsappEntries cell
const cellOld = `<TableCell className="text-right text-green-400 font-medium">{formatNumber(row.whatsappEntries || 0)}</TableCell>`;
const cellNew = `<TableCell className="text-right text-green-400 font-medium">{formatNumber(row.whatsappEntries || 0)}</TableCell>
                        <TableCell className={\`text-right font-medium \${row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100 >= 70 ? "text-green-400" : (row.whatsappEntries / row.leads) * 100 >= 40 ? "text-yellow-400" : "text-red-400") : "text-muted-foreground"}\`}>{row.leads > 0 && (row.whatsappEntries || 0) > 0 ? ((row.whatsappEntries / row.leads) * 100).toFixed(1) + "%" : "-"}</TableCell>`;
code = code.replace(cellOld, cellNew);

fs.writeFileSync(path, code, 'utf8');
console.log('OK - Added % Grupo Wpp column');
