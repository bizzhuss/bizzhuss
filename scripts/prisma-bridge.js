import { prisma } from "../lib/prisma.js";

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  let payloadStr = args[1] || "{}";
  if (payloadStr.startsWith("base64:")) {
    payloadStr = Buffer.from(payloadStr.substring(7), "base64").toString("utf8");
  }

  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch (err) {
    console.error(JSON.stringify({ error: "Invalid JSON payload: " + err.message }));
    process.exit(1);
  }

  try {
    switch (action) {
      case "findUserByEmail": {
        const user = await prisma.user.findUnique({
          where: { email: payload.email },
          include: { vendor: true },
        });
        console.log(JSON.stringify({ success: true, user }));
        break;
      }

      case "findUserById": {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          include: { vendor: true },
        });
        console.log(JSON.stringify({ success: true, user }));
        break;
      }

      case "createUser": {
        const existing = await prisma.user.findUnique({
          where: { email: payload.email },
        });

        if (existing) {
          console.log(JSON.stringify({ success: false, error: "The email has already been taken." }));
          break;
        }

        const newUser = await prisma.user.create({
          data: {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role || "customer",
            phone: payload.phone || null,
            status: "active",
            approvalStatus: "approved",
            avatar: payload.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          },
        });

        // If vendor, create vendor document
        if (payload.role === "vendor") {
          const shopName = payload.shopName || `${payload.name}'s Store`;
          const baseSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

          const vendor = await prisma.vendor.create({
            data: {
              userId: newUser.id,
              shopName,
              slug,
              commissionRate: 10.0,
              status: "active",
              description: `Verified merchant storefront for ${shopName}.`,
            },
          });
          newUser.vendor = vendor;
        }

        console.log(JSON.stringify({ success: true, user: newUser }));
        break;
      }

      case "updateUser": {
        const updated = await prisma.user.update({
          where: { id: payload.id },
          data: payload.data,
        });
        console.log(JSON.stringify({ success: true, user: updated }));
        break;
      }

      case "countUsers": {
        const count = await prisma.user.count();
        console.log(JSON.stringify({ success: true, count }));
        break;
      }

      default:
        console.log(JSON.stringify({ success: false, error: `Unknown action: ${action}` }));
    }
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
  } finally {
    await prisma.$disconnect();
  }
}

main();
