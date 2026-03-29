const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.approvalLog.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  // ─── Create Company ──────────────────────────────────
  const company = await prisma.company.create({
    data: {
      name: 'Acme Corporation',
      defaultCurrency: 'INR',
    },
  });
  console.log('✅ Company created:', company.name);

  // ─── Create Admin ────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'admin@acme.com',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ─── Create Manager ──────────────────────────────────
  const manager = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'manager@acme.com',
      password: hashedPassword,
      role: 'MANAGER',
      companyId: company.id,
    },
  });
  console.log('✅ Manager created:', manager.email);

  // ─── Create Employees ────────────────────────────────
  const emp1 = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'amit@acme.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      managerId: manager.id,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: 'Sneha Gupta',
      email: 'sneha@acme.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      managerId: manager.id,
    },
  });
  console.log('✅ Employees created:', emp1.email, ',', emp2.email);

  // ─── Create Sample Rule ──────────────────────────────
  const rule = await prisma.rule.create({
    data: {
      companyId: company.id,
      type: 'PERCENTAGE',
      config: {
        threshold: 50000,
        approverId: admin.id,
        description: 'Expenses >= ₹50,000 require Admin approval',
      },
    },
  });
  console.log('✅ Rule created: Expenses >= ₹50,000 require extra admin step');

  // ─── Create Sample Expense ───────────────────────────
  const expense = await prisma.expense.create({
    data: {
      amount: 12500,
      currency: 'INR',
      category: 'TRAVEL',
      description: 'Client visit to Mumbai — flight + hotel',
      date: new Date('2026-03-25'),
      status: 'IN_REVIEW',
      userId: emp1.id,
    },
  });

  // Create approval steps for the sample expense
  await prisma.approvalStep.createMany({
    data: [
      { expenseId: expense.id, approverId: manager.id, stepOrder: 1, status: 'PENDING' },
      { expenseId: expense.id, approverId: admin.id, stepOrder: 2, status: 'PENDING' },
    ],
  });
  console.log('✅ Sample expense created: ₹12,500 (TRAVEL)');

  console.log('\n🎉 Seed complete!\n');
  console.log('──────────────────────────────────────');
  console.log('Test credentials (password: password123):');
  console.log('  Admin:    admin@acme.com');
  console.log('  Manager:  manager@acme.com');
  console.log('  Employee: amit@acme.com');
  console.log('  Employee: sneha@acme.com');
  console.log('──────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
