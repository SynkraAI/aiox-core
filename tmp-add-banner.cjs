const fs = require('fs');
const funilPath = '/opt/meta-ads-dashboard/client/src/pages/Funil.tsx';
let funil = fs.readFileSync(funilPath, 'utf8');

// Add the filter banner right after Section 7 opens, before the loading check
// Insert between the Section header closing ">" and the loading check

const anchor = `        <Section number={7} title="Lead Score por Campanha" extra={`;

const bannerCode = `        {/* Survey answer filter banner */}
        {surveyAnswerFilter && (
          <div className="mb-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Filtrado por pesquisa:</span>
              <span className="text-sm text-foreground font-medium">{surveyAnswerFilter.answer}</span>
              <span className="text-xs text-muted-foreground">({surveyAnswerFilter.question})</span>
            </div>
            <button onClick={() => setSurveyAnswerFilter(undefined)} className="text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-md border border-border/50 hover:border-primary/30 bg-background/50">
              Limpar filtro
            </button>
          </div>
        )}

`;

if (funil.includes(anchor)) {
  funil = funil.replace(anchor, bannerCode + anchor);
  console.log('OK - Added filter banner above Lead Score section');
} else {
  console.log('ERROR: anchor not found');
}

fs.writeFileSync(funilPath, funil, 'utf8');
