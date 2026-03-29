const prisma = require('../prisma/client');

class ApprovalService {
  /**
   * Get pending approvals for the current user
   */
  async getPendingApprovals(approverId, { page = 1, limit = 20 }) {
    const where = {
      approverId,
      status: 'PENDING',
      // Only show steps where all prior steps are APPROVED
      expense: {
        status: 'IN_REVIEW',
      },
    };

    const [steps, total] = await Promise.all([
      prisma.approvalStep.findMany({
        where,
        include: {
          expense: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              approvalSteps: {
                orderBy: { stepOrder: 'asc' },
                select: { id: true, stepOrder: true, status: true, approverId: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.approvalStep.count({ where }),
    ]);

    // Filter: only include steps where this is the current step (all prior steps approved)
    const actionable = steps.filter((step) => {
      const allSteps = step.expense.approvalSteps;
      const priorSteps = allSteps.filter((s) => s.stepOrder < step.stepOrder);
      return priorSteps.every((s) => s.status === 'APPROVED');
    });

    return {
      approvals: actionable,
      total: actionable.length,
      page,
      limit,
    };
  }

  /**
   * Approve an approval step
   */
  async approve(stepId, approverId, comment) {
    return this._processAction(stepId, approverId, 'APPROVED', comment);
  }

  /**
   * Reject an approval step
   */
  async reject(stepId, approverId, comment) {
    return this._processAction(stepId, approverId, 'REJECTED', comment);
  }

  /**
   * Core action processor — handles approve/reject logic
   */
  async _processAction(stepId, approverId, action, comment) {
    const step = await prisma.approvalStep.findUnique({
      where: { id: stepId },
      include: {
        expense: {
          include: {
            approvalSteps: { orderBy: { stepOrder: 'asc' } },
          },
        },
      },
    });

    if (!step) {
      throw Object.assign(new Error('Approval step not found'), { statusCode: 404 });
    }

    // Verify this user is the assigned approver
    if (step.approverId !== approverId) {
      throw Object.assign(new Error('You are not the assigned approver for this step'), { statusCode: 403 });
    }

    // Verify step is still pending
    if (step.status !== 'PENDING') {
      throw Object.assign(new Error(`This step has already been ${step.status.toLowerCase()}`), { statusCode: 400 });
    }

    // Verify expense is still in review
    if (step.expense.status !== 'IN_REVIEW') {
      throw Object.assign(new Error('This expense is no longer in review'), { statusCode: 400 });
    }

    // Verify all prior steps are approved
    const priorSteps = step.expense.approvalSteps.filter((s) => s.stepOrder < step.stepOrder);
    const allPriorApproved = priorSteps.every((s) => s.status === 'APPROVED');
    if (!allPriorApproved) {
      throw Object.assign(new Error('Prior approval steps must be completed first'), { statusCode: 400 });
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the step
      const updatedStep = await tx.approvalStep.update({
        where: { id: stepId },
        data: { status: action },
      });

      // Log the action
      await tx.approvalLog.create({
        data: {
          expenseId: step.expenseId,
          approverId,
          action,
          comment: comment || null,
        },
      });

      // Determine final expense status
      if (action === 'REJECTED') {
        // Rejection → immediately reject the expense
        await tx.expense.update({
          where: { id: step.expenseId },
          data: { status: 'REJECTED' },
        });
      } else if (action === 'APPROVED') {
        // Check if this was the last step
        const allSteps = step.expense.approvalSteps;
        const isLastStep = step.stepOrder === Math.max(...allSteps.map((s) => s.stepOrder));

        if (isLastStep) {
          // All steps approved → mark expense as approved
          await tx.expense.update({
            where: { id: step.expenseId },
            data: { status: 'APPROVED' },
          });
        }
      }

      // Return updated expense
      return tx.expense.findUnique({
        where: { id: step.expenseId },
        include: {
          user: { select: { id: true, name: true } },
          approvalSteps: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { stepOrder: 'asc' },
          },
          approvalLogs: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { timestamp: 'asc' },
          },
        },
      });
    });

    return result;
  }
}

module.exports = new ApprovalService();
