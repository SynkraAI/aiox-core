const fs = require('fs');
const path = '/opt/meta-ads-dashboard/client/src/pages/Home.tsx';
let code = fs.readFileSync(path, 'utf8');

// ============================================================
// 1. Rename HEADERS in Campaign table (lines ~806-808)
// ============================================================

// First "Compras" header (Meta purchases) → "Compras Proj."
// It's the one right after "Checkout"
code = code.replace(
  `                      <TableHead className="text-xs font-semibold text-right">Checkout</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Compras</TableHead>
                      <TableHead className="text-xs font-semibold text-right">ROAS</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Receita</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Lucro</TableHead>`,
  `                      <TableHead className="text-xs font-semibold text-right">Checkout</TableHead>
                      <TableHead className="text-xs font-semibold text-right text-emerald-400">Compras Proj.</TableHead>
                      <TableHead className="text-xs font-semibold text-right">ROAS</TableHead>
                      <TableHead className="text-xs font-semibold text-right text-emerald-400">Fat. Projetado</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Lucro</TableHead>`
);

// ============================================================
// 2. Change DATA CELLS to show projected values
// ============================================================

// In the campaign row, the lead score is computed inside an IIFE later.
// We need to compute it BEFORE the Compras/Receita cells.
// Strategy: Move ls computation to a const at the start of the row mapping

// Find the map callback and add ls computation at the top
code = code.replace(
  `                    ) : filteredCampaigns.map(c => {
                      const isSelected = selectedCampaign?.id === c.id;
                      const isHighlighted = adsetCampaignId === c.id && !isSelected;`,
  `                    ) : filteredCampaigns.map(c => {
                      const isSelected = selectedCampaign?.id === c.id;
                      const isHighlighted = adsetCampaignId === c.id && !isSelected;
                      const _ls = getLeadScoreForCampaign(c.nome);
                      const _ticketVal = leadScoring?.ticket || 2800;
                      const _comprasProj = _ls ? Math.round(_ls.totalLeads * (_ls.expectedConvRate / 100)) : 0;
                      const _fatProj = _comprasProj * _ticketVal;`
);

// Replace Compras data cell (the one showing c.compras)
code = code.replace(
  `                          <TableCell className="text-right text-xs tabular-nums">{formatNumber(c.compras)}</TableCell>`,
  `                          <TableCell className="text-right text-xs tabular-nums text-emerald-400">{_comprasProj > 0 ? formatNumber(_comprasProj) : formatNumber(c.compras)}</TableCell>`
);

// Replace Receita data cell (the one showing c.receita)
code = code.replace(
  `                          <TableCell className="text-right text-xs tabular-nums">{formatCurrency(c.receita)}</TableCell>`,
  `                          <TableCell className="text-right text-xs tabular-nums text-emerald-400">{_fatProj > 0 ? formatCurrency(_fatProj) : formatCurrency(c.receita)}</TableCell>`
);

// ============================================================
// 3. Also fix the Lucro column to use projected values
// ============================================================
// Lucro = Receita - Gasto → becomes Fat. Projetado - Gasto
code = code.replace(
  `                          <TableCell className={` + '`' + `text-right text-xs font-semibold tabular-nums ` + '${' + `c.lucro >= 0 ? "text-green-400" : "text-red-400"` + '}' + '`' + `}>{formatCurrency(c.lucro)}</TableCell>`,
  `                          <TableCell className={` + '`' + `text-right text-xs font-semibold tabular-nums ` + '${' + `(_fatProj > 0 ? _fatProj - c.gasto : c.lucro) >= 0 ? "text-green-400" : "text-red-400"` + '}' + '`' + `}>{formatCurrency(_fatProj > 0 ? _fatProj - c.gasto : c.lucro)}</TableCell>`
);

fs.writeFileSync(path, code, 'utf8');

// Verify
const updated = fs.readFileSync(path, 'utf8');
const checks = [
  'Compras Proj.',
  'Fat. Projetado',
  '_comprasProj',
  '_fatProj',
];
for (const ch of checks) {
  const found = updated.includes(ch);
  console.log(`${found ? 'OK' : 'MISSING'}: ${ch}`);
}
console.log('\nPatch applied!');
