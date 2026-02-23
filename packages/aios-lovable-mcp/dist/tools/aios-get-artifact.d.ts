/**
 * MCP Tool: aios_get_artifact
 *
 * Fetches completed job artifacts (PRD, design system, architecture, code files, etc.)
 * by job ID or artifact type.
 */
import { z } from 'zod';
export declare const getArtifactSchema: {
    readonly name: "aios_get_artifact";
    readonly description: "Retrieve generated artifacts from a completed job (PRD, strategy, design system, architecture, code). Returns artifact URL, content, or downloadable package.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly job_id: {
                readonly type: "string";
                readonly description: "The job ID returned by aios_full_pipeline or other tools";
            };
            readonly artifact_type: {
                readonly type: "string";
                readonly enum: readonly ["prd", "strategy", "design_system", "wireframes", "architecture", "code_files", "all"];
                readonly description: "Type of artifact to retrieve (default: all)";
            };
            readonly format: {
                readonly type: "string";
                readonly enum: readonly ["json", "markdown", "html", "zip"];
                readonly description: "Output format - json for structured data, markdown for docs, html for preview, zip for downloadable package (default: json)";
            };
        };
        readonly required: readonly ["job_id"];
    };
};
export declare const GetArtifactInputValidator: z.ZodObject<{
    job_id: z.ZodString;
    artifact_type: z.ZodOptional<z.ZodEnum<["prd", "strategy", "design_system", "wireframes", "architecture", "code_files", "all"]>>;
    format: z.ZodOptional<z.ZodEnum<["json", "markdown", "html", "zip"]>>;
}, "strip", z.ZodTypeAny, {
    job_id: string;
    artifact_type?: "strategy" | "prd" | "design_system" | "wireframes" | "architecture" | "code_files" | "all" | undefined;
    format?: "json" | "markdown" | "html" | "zip" | undefined;
}, {
    job_id: string;
    artifact_type?: "strategy" | "prd" | "design_system" | "wireframes" | "architecture" | "code_files" | "all" | undefined;
    format?: "json" | "markdown" | "html" | "zip" | undefined;
}>;
//# sourceMappingURL=aios-get-artifact.d.ts.map