const fs = require('fs');
const path = '/opt/meta-ads-dashboard/server/routers.ts';
let code = fs.readFileSync(path, 'utf8');

const endpoint = `

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

// Insert BEFORE the closing of meta router, which is:
// "      }),\n  }),"   followed by launches
// The anchor: the last procedure in meta ends with }),  then meta closes with  }),
// Pattern: find "  }),\n\n  launches:" and insert before the first }),
const anchor = '  }),\n\n  launches:';
if (code.includes(anchor)) {
  code = code.replace(anchor, endpoint + '  }),\n\n  launches:');
  fs.writeFileSync(path, code, 'utf8');
  console.log('OK - surveyBreakdown inserted inside meta router');
} else {
  console.log('ERROR: anchor not found');
  // Try alternate
  const alt = '  }),\n  launches:';
  if (code.includes(alt)) {
    code = code.replace(alt, endpoint + '  }),\n  launches:');
    fs.writeFileSync(path, code, 'utf8');
    console.log('OK (alt) - surveyBreakdown inserted inside meta router');
  } else {
    console.log('ERROR: no anchor found at all');
  }
}
