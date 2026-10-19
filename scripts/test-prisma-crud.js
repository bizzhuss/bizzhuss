import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Prisma Client CRUD with MongoDB Atlas ---');
  
  // 1. Query users
  const userCount = await prisma.user.count();
  console.log(`✅ Prisma user.count(): ${userCount}`);

  const admin = await prisma.user.findFirst({
    where: { email: 'admin@bizzhuss.com' },
  });
  console.log(`✅ Prisma found admin: ${admin?.name} (${admin?.email})`);

  // 2. Query categories
  const categories = await prisma.category.findMany();
  console.log(`✅ Prisma category.findMany(): ${categories.length} categories`);

  // 3. Query vendors & relations
  const vendors = await prisma.vendor.findMany({
    include: { user: true },
  });
  console.log(`✅ Prisma vendor.findMany() with user relation: ${vendors.length} vendors`);
  if (vendors.length > 0) {
    console.log(`   Vendor: ${vendors[0].shopName}, linked user: ${vendors[0].user?.name}`);
  }

  // 4. Test CRUD creation & deletion on Category
  const testCat = await prisma.category.create({
    data: {
      name: 'Prisma Audit Category',
      slug: 'prisma-audit-' + Date.now(),
      order: 99,
      isActive: true,
      isVerifiedFeatured: false,
    },
  });
  console.log(`✅ Prisma category.create() generated ObjectId: ${testCat.id}`);

  await prisma.category.delete({
    where: { id: testCat.id },
  });
  console.log(`✅ Prisma category.delete() successfully cleaned up test record`);

  console.log('🎉 ALL PRISMA CRUD TESTS PASSED!');
}

main()
  .catch((e) => {
    console.error('❌ Prisma test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
