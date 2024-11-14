import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'owner' },
      update: {},
      create: {
        name: 'owner',
        permissions: ['*'],
      },
    }),
    prisma.role.upsert({
      where: { name: 'subscriber' },
      update: {},
      create: {
        name: 'subscriber',
        permissions: ['read:content'],
      },
    }),
    prisma.role.upsert({
      where: { name: 'paid_subscriber' },
      update: {},
      create: {
        name: 'paid_subscriber',
        permissions: ['read:content', 'comment:content'],
      },
    }),
  ]);

  console.log('Seeded default roles:', roles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });