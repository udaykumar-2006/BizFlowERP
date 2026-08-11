require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'Admin@123', role: 'ADMIN' },
  { name: 'Sales User', email: 'sales@example.com', password: 'Sales@123', role: 'SALES' },
  { name: 'Warehouse User', email: 'warehouse@example.com', password: 'Warehouse@123', role: 'WAREHOUSE' },
  { name: 'Accounts User', email: 'accounts@example.com', password: 'Accounts@123', role: 'ACCOUNTS' },
];

const seed = async () => {
  console.log('Seeding users...');

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
    console.log(`  ✓ ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('Seeding complete.');
};

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
