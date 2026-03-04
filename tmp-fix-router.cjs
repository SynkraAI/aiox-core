const fs = require('fs');
const path = '/opt/meta-ads-dashboard/server/routers.ts';
let code = fs.readFileSync(path, 'utf8');

// The endpoint is OUTSIDE meta router. Need to move it INSIDE.
// Current structure:
//   ...
//     }),        ← closes last procedure in meta
//   }),          ← closes meta: router({
//
//   surveyBreakdown: publicProcedure  ← WRONG: outside meta
//     ...
//   }),
//
// });            ← closes appRouter

const endpointBlock = `

  surveyBreakdown: publicProcedure
    .input(z.object({
      project: z.string(),
      since: z.string().optional(),
      until: z.string().optional(),
      campaigns: z.array(z.string()).optional(),
      adsets: z.array(z.string()).optional(),
      ads: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const projectKey = input.project || (ctx as any).projectKey;
      if (!projectKey) return { questions: [], totalResponses: 0 };

      const { getProjectSheetsConfig } = await import('./services/sheets-config');
      const sheetsConfig = await getProjectSheetsConfig(projectKey);
      if (!sheetsConfig || !sheetsConfig.leads?.length || !sheetsConfig.surveys?.length) {
        return { questions: [], totalResponses: 0 };
      }

      return getSurveyBreakdown(
        sheetsConfig,
        { since: input.since, until: input.until },
        {
          campaigns: input.campaigns,
          adsets: input.adsets,
          ads: input.ads,
        },
      );
    }),
`;

// Remove the wrongly placed endpoint + trailing });
const wrongBlock = /\n\n  surveyBreakdown: publicProcedure[\s\S]*?\),\n\n\}\);$/;
code = code.replace(wrongBlock, '\n});');

// Now insert it inside meta router - before the closing }),  of meta
// Find the pattern: last   }),\n}); which is meta close + appRouter close
// Replace with: endpoint + }),\n});
const metaClose = '  }),\n});';
const lastIdx = code.lastIndexOf(metaClose);
if (lastIdx > -1) {
  code = code.slice(0, lastIdx) + endpointBlock + '\n  }),\n});';
}

fs.writeFileSync(path, code, 'utf8');
console.log('OK - Moved surveyBreakdown inside meta router');
