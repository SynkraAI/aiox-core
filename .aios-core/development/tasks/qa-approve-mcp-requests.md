# QA: Approve MCP Tool Requests

**Objective:** Review and approve/reject pending MCP tool execution requests from Lovable
**Agent:** @qa (Quinn)
**Frequency:** As needed (triggered by pending requests)
**Urgency:** High (blocks tool execution)

---

## 🔐 Authorization Context

As @qa, you are the **sole gatekeeper** for:
- ✅ Tool execution approvals (aios_strategize, aios_design_ux, etc.)
- ✅ Request validation and security review
- ✅ Reason documentation for rejections

No other agent can approve requests. This ensures centralized quality control.

---

## 📋 Your Workflow

### **Step 1: Check Pending Requests**

```bash
curl -H "Authorization: Bearer aios_lovable_mlyixanmi1ooyce8ys" \
  https://aios-lovable-mcp-production-6f63.up.railway.app/api/approval/pending
```

Or use the report endpoint:
```bash
curl -H "Authorization: Bearer aios_lovable_mlyixanmi1ooyce8ys" \
  https://aios-lovable-mcp-production-6f63.up.railway.app/api/approval/report
```

**Response Example:**
```json
{
  "pending_count": 2,
  "requests": [
    {
      "id": "uuid-1234",
      "tool": "aios_strategize",
      "input_summary": "{\"product_name\":\"Quiz App\",\"description\":\"...",
      "requested_at": "2026-02-23T09:15:00.000Z"
    },
    {
      "id": "uuid-5678",
      "tool": "aios_design_ux",
      "input_summary": "{\"product_name\":\"Dashboard\",\"user_flows\":...",
      "requested_at": "2026-02-23T09:16:00.000Z"
    }
  ]
}
```

---

### **Step 2: Review Each Request**

For each pending request, evaluate:

| Criteria | Check |
|----------|-------|
| **Tool** | Is this a known AIOS tool? |
| **Input** | Are parameters valid and complete? |
| **Security** | Could this cause harm? |
| **Scope** | Is this within approved use? |
| **Precedent** | Have similar requests been approved before? |

---

### **Step 3: Approve Request**

If the request passes all checks:

```bash
curl -X POST \
  -H "Authorization: Bearer aios_lovable_mlyixanmi1ooyce8ys" \
  https://aios-lovable-mcp-production-6f63.up.railway.app/api/approval/{REQUEST_ID}/approve
```

**Response:**
```json
{
  "status": "approved",
  "request_id": "uuid-1234",
  "approval_id": "uuid-1234",
  "next_step": "Retry job creation with approval_id parameter"
}
```

---

### **Step 4: Reject Request**

If the request has issues:

```bash
curl -X POST \
  -H "Authorization: Bearer aios_lovable_mlyixanmi1ooyce8ys" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Input parameters incomplete. Missing product_name."
  }' \
  https://aios-lovable-mcp-production-6f63.up.railway.app/api/approval/{REQUEST_ID}/reject
```

**Response:**
```json
{
  "status": "rejected",
  "request_id": "uuid-1234",
  "reason": "Input parameters incomplete. Missing product_name."
}
```

---

## ✅ Approval Checklist

Before approving, confirm:

- [ ] Tool exists in the 7 available AIOS tools
- [ ] Input parameters are complete and valid
- [ ] No sensitive information in payload
- [ ] Request matches stated intent
- [ ] No rate limit concerns
- [ ] Documentation is sufficient

---

## ❌ Common Rejection Reasons

| Reason | Example |
|--------|---------|
| Missing input | "Missing required parameter: product_name" |
| Invalid format | "Input must be JSON object, got array" |
| Security concern | "Payload contains credentials - rejected for security" |
| Suspicious pattern | "Third request in 30s - possible abuse detected" |
| Out of scope | "Tool not in approved AIOS tool list" |

---

## 📊 Available AIOS Tools

You can approve requests for these tools:

1. **aios_strategize** - Product strategy & PRD generation
2. **aios_design_ux** - UX/Design system specs
3. **aios_design_architecture** - System architecture design
4. **aios_generate_code** - Code generation
5. **aios_full_pipeline** - End-to-end orchestration
6. **aios_get_status** - Job status monitoring
7. **aios_get_artifact** - Retrieve generated artifacts

---

## 📈 Approval Metrics

Track your approvals:
- Total approved
- Total rejected
- Average review time
- Common rejection reasons

---

## 🔄 Retry Flow

**User sees:**
```json
{
  "status": "pending_approval",
  "approval_id": "uuid-1234",
  "message": "Awaiting @qa validation"
}
```

**After you approve, user retries with:**
```bash
curl -X POST https://.../api/jobs \
  -d '{
    "tool": "aios_strategize",
    "input": {...},
    "approval_id": "uuid-1234"
  }'
```

Job then executes immediately!

---

## 📞 Escalation

If you need help:
1. Contact @aios-master for system questions
2. Contact @devops for infrastructure issues
3. Contact user directly if input is ambiguous

---

## 🔐 Security Notes

- ✅ All requests logged with timestamp
- ✅ All approvals audited
- ✅ Rejections include reasons
- ✅ No bypass mechanisms exist
- ✅ @qa is the only approver

---

**Last Updated:** 2026-02-23
**Version:** 1.0.0
