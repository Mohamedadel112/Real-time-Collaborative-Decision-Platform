const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jurist.ai' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@jurist.ai',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created/updated:`);
  console.log(`   Email:    admin@jurist.ai`);
  console.log(`   Password: admin123`);
  console.log(`   Role:     ${admin.role}`);
  console.log(`   ID:       ${admin.id}\n`);

  // Create a test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'testuser@jurist.ai' },
    update: {},
    create: {
      email: 'testuser@jurist.ai',
      username: 'testuser',
      passwordHash: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Test user created/updated:`);
  console.log(`   Email:    testuser@jurist.ai`);
  console.log(`   Password: user123`);
  console.log(`   Role:     ${user.role}`);
  console.log(`   ID:       ${user.id}\n`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
