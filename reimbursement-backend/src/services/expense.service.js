const prisma = require('../prisma/client');
const approvalWorkflow = require('./approvalWorkflow.service');

class ExpenseService {
  /**
   * Submit a new expense — auto-generates approval steps
   */
  async createExpense({ amount, currency, category, description, date, userId, companyId }) {
    const expense = await prisma.$transaction(async (tx) => {
      // Create the expense
      const exp = await tx.expense.create({
        data: {
          amount,
          currency: currency || 'INR',
          category,
          description,
          date: new Date(date),
          status: 'PENDING',
          userId,
        },
      });

      // Generate approval chain
      await approvalWorkflow.generateApprovalSteps(tx, exp, userId, companyId);

      // Update status to IN_REVIEW since steps are created
      const updated = await tx.expense.update({
        where: { id: exp.id },
        data: { status: 'IN_REVIEW' },
        include: {
          approvalSteps: {
            include: { approver: { select: { id: true, name: true, role: true } } },
            orderBy: { stepOrder: 'asc' },
          },
        },
      });

      return updated;
    });

    return expense;
  }

  /**
   * Get expenses for the logged-in employee
   */
  async getMyExpenses(userId, { page = 1, limit = 20, status }) {
    const where = { userId };
    if (status) where.status = status;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          approvalSteps: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { stepOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get expenses submitted by the manager's team members
   */
  async getTeamExpenses(managerId, companyId, { page = 1, limit = 20, status }) {
    const where = {
      user: {
        managerId,
        companyId,
      },
    };
    if (status) where.status = status;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          approvalSteps: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { stepOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a single expense by ID (with permission check)
   */
  async getExpenseById(expenseId, userId, role, companyId) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        user: { select: { id: true, name: true, email: true, companyId: true } },
        approvalSteps: {
          include: { approver: { select: { id: true, name: true, role: true } } },
          orderBy: { stepOrder: 'asc' },
        },
        approvalLogs: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!expense) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }

    // Access check: owner, approver in chain, or admin of same company
    const isOwner = expense.userId === userId;
    const isApprover = expense.approvalSteps.some((s) => s.approverId === userId);
    const isAdmin = role === 'ADMIN' && expense.user.companyId === companyId;

    if (!isOwner && !isApprover && !isAdmin) {
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }

    return expense;
  }
}

module.exports = new ExpenseService();
