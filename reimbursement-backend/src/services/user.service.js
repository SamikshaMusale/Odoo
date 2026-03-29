const prisma = require('../prisma/client');
const { hashPassword } = require('../utils/auth');

class UserService {
  /**
   * Create a new user (Employee or Manager) within the admin's company
   */
  async createUser({ name, email, password, role, managerId, companyId }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: managerId, companyId, role: 'MANAGER' },
      });
      if (!manager) {
        throw Object.assign(new Error('Invalid manager ID — must be a MANAGER in the same company'), { statusCode: 400 });
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId,
        managerId: managerId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Assign a manager to a user
   */
  async assignManager({ userId, managerId, companyId }) {
    // Verify user belongs to same company
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });
    if (!user) {
      throw Object.assign(new Error('User not found in your company'), { statusCode: 404 });
    }

    // Verify manager exists and is a MANAGER
    const manager = await prisma.user.findFirst({
      where: { id: managerId, companyId, role: 'MANAGER' },
    });
    if (!manager) {
      throw Object.assign(new Error('Invalid manager — must be a MANAGER in the same company'), { statusCode: 400 });
    }

    // Prevent self-assignment
    if (userId === managerId) {
      throw Object.assign(new Error('Cannot assign a user as their own manager'), { statusCode: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { managerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
      },
    });

    return updated;
  }

  /**
   * Update user role
   */
  async updateUserRole({ userId, newRole, companyId }) {
    // Verify user belongs to same company
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });
    if (!user) {
      throw Object.assign(new Error('User not found in your company'), { statusCode: 404 });
    }

    // Prevent changing ADMIN role
    if (user.role === 'ADMIN') {
      throw Object.assign(new Error('Cannot change the role of an admin user'), { statusCode: 400 });
    }

    // Validate new role
    if (!['MANAGER', 'EMPLOYEE'].includes(newRole)) {
      throw Object.assign(new Error('Role must be MANAGER or EMPLOYEE'), { statusCode: 400 });
    }

    // If changing from MANAGER to EMPLOYEE, handle subordinates
    if (user.role === 'MANAGER' && newRole === 'EMPLOYEE') {
      // Clear managerId from subordinates (they no longer have a manager)
      await prisma.user.updateMany({
        where: { managerId: userId },
        data: { managerId: null },
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
      },
    });

    return updated;
  }

  /**
   * List all users in the company
   */
  async listUsers(companyId) {
    return prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        managerId: true,
        company: {
          select: {
            id: true,
            name: true,
            defaultCurrency: true,
          },
        },
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }
}

module.exports = new UserService();
