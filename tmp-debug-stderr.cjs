const fs = require('fs');
const routerPath = '/opt/meta-ads-dashboard/server/routers.ts';
let router = fs.readFileSync(routerPath, 'utf8');

// Replace console.log with process.stderr.write
router = router.replace(
  `console.log("[ROUTER-DEBUG] aggregated keys:", Object.keys(aggregated));`,
  `process.stderr.write("[ROUTER-DEBUG] aggregated keys: " + Object.keys(aggregated).join(",") + "\\n");`
);

// Also add debug at the very start of the handler
router = router.replace(
  `    leadScoring: publicProcedure`,
  `    leadScoring: publicProcedure /* DEBUG-MARK */`
);

router = router.replace(
  `.query(async ({ input }) => {
        const projectKey = input?.project;`,
  `.query(async ({ input }) => {
        process.stderr.write("[LEADSCORE-ENTRY] called with project: " + (input?.project || "none") + "\\n");
        const projectKey = input?.project;`
);

fs.writeFileSync(routerPath, router, 'utf8');
console.log('OK - stderr debug added');
