const prisma = require('../prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

class AuthService {
  /**
   * Signup — creates a new Company + Admin user
   */
  async signup({ name, email, password, companyName, defaultCurrency }) {
    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Transaction: create company + admin user atomically
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          defaultCurrency: defaultCurrency || 'INR',
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      return { company, user };
    });

    const token = generateToken({
      userId: result.user.id,
      role: result.user.role,
      companyId: result.company.id,
    });

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
      },
    };
  }

  /**
   * Login — validates credentials and returns JWT
   */
  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: { select: { id: true, name: true } } },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: user.company,
    };
  }
}

module.exports = new AuthService();
