# Database Design Checklist

## Instructions for Data Engineer Agent

When designing a new database schema or reviewing significant changes, go through each item in this checklist. Report the status of each item (e.g., [x] Done, [ ] Not Done, [N/A] Not Applicable) and provide brief comments if necessary.

[[LLM: INITIALIZATION INSTRUCTIONS - DATABASE DESIGN VALIDATION

This checklist is for DATA ENGINEER AGENTS validating database schema designs.

IMPORTANT: Good database design prevents problems that are expensive to fix later. Take time to verify each item.

EXECUTION APPROACH:

1. Review the complete design before checking items
2. Mark items as [x] Done, [ ] Not Done, or [N/A] Not Applicable
3. Add comments explaining design decisions
4. Flag potential issues or trade-offs
5. Consider both current and future requirements

Design for correctness first, then optimize.]]

## Checklist Items

1. **Domain Model Alignment:**

   [[LLM: Schema should reflect business requirements]]

   - [ ] All required entities from domain model are represented
   - [ ] Entity relationships match business logic
   - [ ] Cardinality (1:1, 1:N, M:N) correctly implemented
   - [ ] Business rules can be enforced at database level
   - [ ] Naming conventions are consistent and meaningful

2. **Table Design:**

   [[LLM: Tables are the foundation. Get them right]]

   - [ ] Every table has a primary key (preferably UUID)
   - [ ] created_at and updated_at timestamps on all tables
   - [ ] Soft delete (deleted_at) where audit trail needed
   - [ ] Appropriate data types chosen for each column
   - [ ] Column names follow snake_case convention

3. **Relationships & Constraints:**

   [[LLM: Constraints protect data integrity]]

   - [ ] Foreign keys defined for all relationships
   - [ ] ON DELETE behavior specified (CASCADE, SET NULL, RESTRICT)
   - [ ] Unique constraints on business keys
   - [ ] CHECK constraints for value validation
   - [ ] NOT NULL on required fields

4. **Indexing Strategy:**

   [[LLM: Indexes enable performance. Plan them carefully]]

   - [ ] Primary key automatically indexed
   - [ ] Foreign keys have indexes
   - [ ] Frequently queried columns indexed
   - [ ] Composite indexes for common query patterns
   - [ ] No over-indexing (each index has justification)

5. **Normalization & Denormalization:**

   [[LLM: Balance normalization with practical needs]]

   - [ ] At minimum 3NF (Third Normal Form) achieved
   - [ ] Denormalization decisions documented with justification
   - [ ] No data redundancy without explicit reason
   - [ ] Update anomalies prevented
   - [ ] Delete anomalies prevented

6. **Security Design:**

   [[LLM: Security must be built in, not bolted on]]

   - [ ] Tables categorized by sensitivity level
   - [ ] RLS policy strategy defined for each table
   - [ ] Sensitive columns identified (PII, credentials)
   - [ ] Audit logging requirements defined
   - [ ] Access patterns documented

7. **Performance Considerations:**

   [[LLM: Design for expected scale and access patterns]]

   - [ ] Expected data volumes estimated
   - [ ] Query patterns identified and optimized for
   - [ ] Partitioning strategy considered (if large tables)
   - [ ] Archival strategy for old data considered
   - [ ] Read/write ratio considered

8. **Documentation:**

   [[LLM: Others need to understand your design]]

   - [ ] Entity-Relationship Diagram (ERD) created
   - [ ] Each table purpose documented
   - [ ] Complex relationships explained
   - [ ] Design decisions recorded
   - [ ] COMMENT ON planned for production schema

## Final Confirmation

[[LLM: FINAL DESIGN REVIEW SUMMARY

After completing the checklist:

1. Summarize the database design
2. List any items marked as [ ] Not Done with explanations
3. Document known trade-offs and their rationale
4. Identify areas that may need future attention
5. Confirm design is ready for implementation

Good design is the foundation of reliable systems.]]

- [ ] I, the Data Engineer Agent, confirm that this database design has been thoroughly reviewed and is ready for implementation.
