/**
 * MCP Tool Execution Approval System
 *
 * Manages approval workflow for tool executions.
 * @qa (Quinn) validates and approves all tool requests before execution.
 */

import { randomUUID } from 'crypto';

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

class ApprovalSystem {
  private requests = new Map<string, ApprovalRequest>();

  /**
   * Create a new approval request for a tool execution
   */
  createRequest(tool: string, input: Record<string, any>, apiKey: string): string {
    const requestId = randomUUID();
    const request: ApprovalRequest = {
      id: requestId,
      tool,
      input,
      requestedBy: apiKey,
      requestedAt: new Date(),
      status: 'pending',
    };

    this.requests.set(requestId, request);
    console.error(`[Approval] 🔔 New request: ${requestId} (${tool})`);
    console.error(`[Approval] Awaiting @qa validation...`);

    return requestId;
  }

  /**
   * Get approval request by ID
   */
  getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Check if request is approved
   */
  isApproved(requestId: string): boolean {
    const request = this.requests.get(requestId);
    return request?.status === 'approved' || false;
  }

  /**
   * List all pending requests
   */
  getPendingRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => r.status === 'pending');
  }

  /**
   * Approve a request (@qa action)
   */
  approveRequest(requestId: string, approvedBy: string = '@qa'): ApprovalRequest | null {
    const request = this.requests.get(requestId);
    if (!request) {
      console.error(`[Approval] ❌ Request not found: ${requestId}`);
      return null;
    }

    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    console.error(`[Approval] ✅ APPROVED: ${requestId} (${request.tool})`);
    console.error(`[Approval] By: ${approvedBy} at ${request.approvedAt.toISOString()}`);

    return request;
  }

  /**
   * Reject a request (@qa action)
   */
  rejectRequest(requestId: string, reason: string, rejectedBy: string = '@qa'): ApprovalRequest | null {
    const request = this.requests.get(requestId);
    if (!request) {
      console.error(`[Approval] ❌ Request not found: ${requestId}`);
      return null;
    }

    request.status = 'rejected';
    request.approvedBy = rejectedBy;
    request.approvedAt = new Date();
    request.reason = reason;

    console.error(`[Approval] ❌ REJECTED: ${requestId} (${request.tool})`);
    console.error(`[Approval] Reason: ${reason}`);

    return request;
  }

  /**
   * Get approval history (completed requests)
   */
  getHistory(limit: number = 50): ApprovalRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.status !== 'pending')
      .sort((a, b) => (b.approvedAt?.getTime() || 0) - (a.approvedAt?.getTime() || 0))
      .slice(0, limit);
  }

  /**
   * Get detailed report for @qa
   */
  getReport(): {
    pending: number;
    approved: number;
    rejected: number;
    requests: ApprovalRequest[];
  } {
    const pending = Array.from(this.requests.values()).filter(r => r.status === 'pending');
    const approved = Array.from(this.requests.values()).filter(r => r.status === 'approved');
    const rejected = Array.from(this.requests.values()).filter(r => r.status === 'rejected');

    return {
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      requests: pending,
    };
  }

  /**
   * Clear old requests (older than 24 hours)
   */
  cleanup(): number {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let removedCount = 0;
    for (const [id, request] of this.requests.entries()) {
      if (request.status !== 'pending' && request.approvedAt && request.approvedAt < twentyFourHoursAgo) {
        this.requests.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.error(`[Approval] 🧹 Cleaned up ${removedCount} old requests`);
    }

    return removedCount;
  }
}

export const approvalSystem = new ApprovalSystem();
