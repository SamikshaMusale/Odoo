const prisma = require('../prisma/client');

/**
 * Approval Workflow Service
 *
 * Generates approval chains and handles step progression.
 * Current logic:
 *   Step 1 → Direct Manager
 *   Step 2 → Admin (final approver)
 *
 * Extensible: Override via Rule-based config (percentage, specific approver, hybrid).
 */
class ApprovalWorkflowService {
  /**
   * Generate approval steps for a new expense
   * Called inside a transaction context
   */
  async generateApprovalSteps(tx, expense, userId, companyId) {
    const submitter = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, managerId: true, role: true },
    });

    const approvers = [];

    // Step 1: Direct manager (if assigned)
    if (submitter.managerId) {
      approvers.push(submitter.managerId);
    }

    // Step 2: Check for rule-based overrides
    const rules = await tx.rule.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    for (const rule of rules) {
      const override = this._evaluateRule(rule, expense);
      if (override) {
        // Add specific approver if not already in chain
        if (!approvers.includes(override)) {
          approvers.push(override);
        }
      }
    }

    // Final step: Company admin (if not already in chain)
    const admin = await tx.user.findFirst({
      where: { companyId, role: 'ADMIN' },
      select: { id: true },
    });

    if (admin && !approvers.includes(admin.id) && admin.id !== userId) {
      approvers.push(admin.id);
    }

    // Create approval steps
    if (approvers.length === 0) {
      throw Object.assign(new Error('No approvers found — cannot create approval chain'), { statusCode: 400 });
    }

    const steps = approvers.map((approverId, index) => ({
      expenseId: expense.id,
      approverId,
      stepOrder: index + 1,
      status: 'PENDING',
    }));

    await tx.approvalStep.createMany({ data: steps });

    return steps;
  }

  /**
   * Evaluate a single rule against an expense
   * Returns an approver ID override, or null
   */
  _evaluateRule(rule, expense) {
    const config = rule.config;

    switch (rule.type) {
      case 'PERCENTAGE':
        // Example config: { "threshold": 10000, "approverId": "uuid" }
        // If expense exceeds threshold, require specific approver
        if (config.threshold && expense.amount >= config.threshold && config.approverId) {
          return config.approverId;
        }
        return null;

      case 'SPECIFIC_APPROVER':
        // Example config: { "categories": ["TRAVEL", "EQUIPMENT"], "approverId": "uuid" }
        if (config.categories?.includes(expense.category) && config.approverId) {
          return config.approverId;
        }
        return null;

      case 'HYBRID':
        // Combine percentage + category logic
        const amountMatch = config.threshold ? expense.amount >= config.threshold : false;
        const categoryMatch = config.categories?.includes(expense.category) || false;
        if ((amountMatch || categoryMatch) && config.approverId) {
          return config.approverId;
        }
        return null;

      default:
        return null;
    }
  }
}

module.exports = new ApprovalWorkflowService();
