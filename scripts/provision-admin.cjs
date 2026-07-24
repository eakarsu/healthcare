const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  const email = String(process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || '');
  const name = String(process.env.PROVISION_ADMIN_NAME || '').trim();
  if (!email.includes('@') || password.length < 12 || !name) throw new Error('Valid PROVISION_ADMIN_* environment is required');
  const existing = await prisma.user.findUnique({ where: { email } });
  const [firstName, ...last] = name.split(/\s+/);
  if (existing) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: await bcrypt.hash(password, 12),
        firstName,
        lastName: last.join(' ') || 'Administrator',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        failedLogins: 0,
        lockedUntil: null,
      },
    });
    console.log(JSON.stringify({ event: 'runtime_admin_updated', userId: user.id, practiceId: user.practiceId }));
    return;
  }
  const practice = await prisma.practice.create({
    data: { name: process.env.PROVISION_COMPANY_NAME || 'Runtime Acceptance Practice', specialty: 'PRIMARY_CARE' },
  });
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 12),
      firstName,
      lastName: last.join(' ') || 'Administrator',
      role: 'ADMIN',
      practiceId: practice.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(JSON.stringify({ event: 'initial_admin_created', userId: user.id, practiceId: practice.id }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
