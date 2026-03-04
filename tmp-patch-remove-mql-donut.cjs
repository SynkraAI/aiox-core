const fs = require('fs');
const path = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let code = fs.readFileSync(path, 'utf8');

const old = `                {/* DONUT: MQL Distribution */}
                <Card className="bg-card border-border/50">
                  <CardHeader className="pb-1 pt-3 px-4">
                    <CardTitle className="text-sm font-medium">Distribuicao MQL</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Leads por grade</p>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={campDonutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name" stroke="none">
                          {campDonutData.map((entry, idx) => (
                            <Cell key={idx} fill={MQL_COLORS[entry.name] || "#6b7280"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatNumber(v)} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "#a1a1aa" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>`;

if (code.includes(old)) {
  code = code.replace(old, '');
  fs.writeFileSync(path, code, 'utf8');
  console.log('OK - Removed Distribuicao MQL donut card');
} else {
  console.log('ERRO: trecho nao encontrado');
}
