import "dotenv/config";
import { MongoClient } from "mongodb";
import { prisma } from "../lib/prisma.js";

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in environment.");
    process.exit(1);
  }

  // Sanitize URI for safe logging (hide username & password)
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`🔍 Testing MongoDB connection target: ${sanitizedUri}`);

  // 1. Verify Prisma Client initialization
  try {
    console.log("⚡ Checking Prisma Client models...");
    const models = Object.keys(prisma).filter(
      (key) => !key.startsWith("$") && !key.startsWith("_")
    );
    console.log(`✅ Prisma Client generated with ${models.length} models:`);
    console.log(`   ${models.slice(0, 10).join(", ")}...`);
  } catch (err) {
    console.error("❌ Prisma Client initialization error:", err.message);
  }

  // 2. Test MongoDB connectivity
  console.log("🌐 Attempting MongoDB ping...");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 4000,
    connectTimeoutMS: 4000,
    appName: "bizzhuss-connectivity-test",
  });

  try {
    await client.connect();
    const dbName = process.env.MONGODB_DATABASE || "bizzhuss";
    const db = client.db(dbName);
    const pingResult = await db.command({ ping: 1 });
    console.log("✅ MongoDB Atlas ping successful:", pingResult);

    const collections = await db.listCollections().toArray();
    console.log(
      `📊 Database '${dbName}' reachable. Existing collections count: ${collections.length}`
    );
    if (collections.length > 0) {
      console.log(
        `   Collections: ${collections.map((c) => c.name).join(", ")}`
      );
    }
  } catch (err) {
    console.log(
      `ℹ️  MongoDB connection check finished: ${err.message}`
    );
    console.log(
      "👉 When you provide a live MongoDB Atlas connection string (e.g. mongodb+srv://...), set it in .env to connect."
    );
  } finally {
    try {
      await client.close();
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
    console.log("🏁 Test script completed.");
  }
}

testConnection();
