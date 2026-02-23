/**
 * MCP Tool Execution Approval System
 *
 * Manages approval workflow for tool executions.
 * @qa (Quinn) validates and approves all tool requests before execution.
 */
export interface ApprovalRequest {
    id: string;
    tool: string;
    input: Record<string, any>;
    requestedBy: string;
    requestedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    reason?: string;
}
declare class ApprovalSystem {
    private requests;
    /**
     * Create a new approval request for a tool execution
     */
    createRequest(tool: string, input: Record<string, any>, apiKey: string): string;
    /**
     * Get approval request by ID
     */
    getRequest(requestId: string): ApprovalRequest | undefined;
    /**
     * Check if request is approved
     */
    isApproved(requestId: string): boolean;
    /**
     * List all pending requests
     */
    getPendingRequests(): ApprovalRequest[];
    /**
     * Approve a request (@qa action)
     */
    approveRequest(requestId: string, approvedBy?: string): ApprovalRequest | null;
    /**
     * Reject a request (@qa action)
     */
    rejectRequest(requestId: string, reason: string, rejectedBy?: string): ApprovalRequest | null;
    /**
     * Get approval history (completed requests)
     */
    getHistory(limit?: number): ApprovalRequest[];
    /**
     * Get detailed report for @qa
     */
    getReport(): {
        pending: number;
        approved: number;
        rejected: number;
        requests: ApprovalRequest[];
    };
    /**
     * Clear old requests (older than 24 hours)
     */
    cleanup(): number;
}
export declare const approvalSystem: ApprovalSystem;
export {};
//# sourceMappingURL=approval-system.d.ts.map