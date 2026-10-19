import fs from "fs";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

async function runMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not configured in .env");
    process.exit(1);
  }

  const backupFile = "database-backups/mysql_backup_2026-10-19_15-09-10.sql";
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found at ${backupFile}`);
    process.exit(1);
  }

  console.log(`📦 Loading MySQL backup from ${backupFile}...`);
  const sql = fs.readFileSync(backupFile, "utf8");

  // Helper to parse SQL INSERT rows into raw array of values
  function extractInsertRows(tableName) {
    const insertPrefix = `INSERT INTO \`${tableName}\` VALUES `;
    const rows = [];
    const lines = sql.split("\n");

    for (const line of lines) {
      if (line.startsWith(insertPrefix)) {
        const dataStr = line.substring(insertPrefix.length).trim().replace(/;$/, "");

        let inString = false;
        let escape = false;
        let depth = 0;
        let currentTuple = "";

        for (let i = 0; i < dataStr.length; i++) {
          const char = dataStr[i];

          if (escape) {
            currentTuple += char;
            escape = false;
            continue;
          }

          if (char === "\\") {
            currentTuple += char;
            escape = true;
            continue;
          }

          if (char === "'") {
            inString = !inString;
            currentTuple += char;
            continue;
          }

          if (!inString) {
            if (char === "(") {
              depth++;
              if (depth === 1) {
                currentTuple = "";
                continue;
              }
            } else if (char === ")") {
              depth--;
              if (depth === 0) {
                // Parse tuple fields
                rows.push(parseTuple(currentTuple));
                currentTuple = "";
                continue;
              }
            }
          }

          if (depth > 0) {
            currentTuple += char;
          }
        }
      }
    }
    return rows;
  }

  function parseTuple(tupleStr) {
    const fields = [];
    let currentField = "";
    let inString = false;
    let escape = false;

    for (let i = 0; i < tupleStr.length; i++) {
      const char = tupleStr[i];

      if (escape) {
        currentField += char;
        escape = false;
        continue;
      }

      if (char === "\\") {
        currentField += char;
        escape = true;
        continue;
      }

      if (char === "'") {
        inString = !inString;
        continue;
      }

      if (!inString && char === ",") {
        fields.push(cleanFieldValue(currentField.trim()));
        currentField = "";
        continue;
      }

      currentField += char;
    }
    fields.push(cleanFieldValue(currentField.trim()));
    return fields;
  }

  function cleanFieldValue(val) {
    if (val === "NULL") return null;
    if (val === "true") return true;
    if (val === "false") return false;
    // Check if numeric
    if (!isNaN(val) && val !== "" && !isNaN(parseFloat(val))) {
      return Number(val);
    }
    return val;
  }

  function parseDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr.replace(" ", "T") + "Z");
  }

  console.log("🌐 Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DATABASE || "bizzhuss";
  const db = client.db(dbName);
  console.log(`✅ Connected to database '${dbName}'`);

  const idMap = {
    users: {},
    roles: {},
    permissions: {},
    categories: {},
    departments: {},
    designations: {},
  };

  const migrationStats = {};

  try {
    // ==========================================
    // 1. MIGRATE ROLES
    // ==========================================
    console.log("\n--- Migrating Roles ---");
    const roleRows = extractInsertRows("roles");
    // (id, name, guard_name, created_at, updated_at)
    const rolesCollection = db.collection("roles");
    for (const r of roleRows) {
      const mysqlId = r[0];
      const name = r[1];
      const guardName = r[2] || "web";
      const createdAt = parseDate(r[3]) || new Date();
      const updatedAt = parseDate(r[4]) || new Date();

      const existing = await rolesCollection.findOne({ name });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await rolesCollection.updateOne(
          { _id: mongoId },
          { $set: { guard_name: guardName, mysql_id: mysqlId, updated_at: updatedAt } }
        );
      } else {
        mongoId = new ObjectId();
        await rolesCollection.insertOne({
          _id: mongoId,
          name,
          guard_name: guardName,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.roles[mysqlId] = mongoId;
    }
    migrationStats.roles = roleRows.length;
    console.log(`✅ Migrated ${roleRows.length} roles.`);

    // ==========================================
    // 2. MIGRATE PERMISSIONS
    // ==========================================
    console.log("\n--- Migrating Permissions ---");
    const permRows = extractInsertRows("permissions");
    // (id, name, guard_name, created_at, updated_at)
    const permsCollection = db.collection("permissions");
    for (const p of permRows) {
      const mysqlId = p[0];
      const name = p[1];
      const guardName = p[2] || "web";
      const createdAt = parseDate(p[3]) || new Date();
      const updatedAt = parseDate(p[4]) || new Date();

      const existing = await permsCollection.findOne({ name });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await permsCollection.updateOne(
          { _id: mongoId },
          { $set: { guard_name: guardName, mysql_id: mysqlId, updated_at: updatedAt } }
        );
      } else {
        mongoId = new ObjectId();
        await permsCollection.insertOne({
          _id: mongoId,
          name,
          guard_name: guardName,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.permissions[mysqlId] = mongoId;
    }
    migrationStats.permissions = permRows.length;
    console.log(`✅ Migrated ${permRows.length} permissions.`);

    // ==========================================
    // 3. MAP ROLE HAS PERMISSIONS
    // ==========================================
    const roleHasPerms = extractInsertRows("role_has_permissions");
    // (permission_id, role_id)
    console.log(`ℹ️ Mapping ${roleHasPerms.length} role-permission relationships...`);
    const permsByRole = {};
    for (const [permId, roleId] of roleHasPerms) {
      if (!permsByRole[roleId]) permsByRole[roleId] = [];
      if (idMap.permissions[permId]) {
        permsByRole[roleId].push(idMap.permissions[permId]);
      }
    }
    for (const [roleId, permObjIds] of Object.entries(permsByRole)) {
      if (idMap.roles[roleId]) {
        await rolesCollection.updateOne(
          { _id: idMap.roles[roleId] },
          { $set: { permission_ids: permObjIds } }
        );
      }
    }

    // ==========================================
    // 4. MAP USER ROLES (model_has_roles)
    // ==========================================
    const modelHasRoles = extractInsertRows("model_has_roles");
    // (role_id, model_type, model_id)
    const userRoleMap = {};
    for (const [roleId, modelType, modelId] of modelHasRoles) {
      if (modelType === "App\\Models\\User") {
        userRoleMap[modelId] = roleId;
      }
    }

    // ==========================================
    // 5. MIGRATE USERS
    // ==========================================
    console.log("\n--- Migrating Users ---");
    const userRows = extractInsertRows("users");
    // (id, name, email, google_id, role, status, approval_status, phone, avatar, email_verified_at, password, remember_token, created_at, updated_at)
    const usersCollection = db.collection("users");
    for (const u of userRows) {
      const mysqlId = u[0];
      const name = u[1];
      const email = u[2];
      const googleId = u[3] || null;
      let role = u[4] || "customer";
      const status = u[5] || "active";
      const approvalStatus = u[6] || "approved";
      const phone = u[7] || null;
      const avatar = u[8] || null;
      const emailVerifiedAt = parseDate(u[9]);
      const password = u[10] || null;
      const rememberToken = u[11] || null;
      const createdAt = parseDate(u[12]) || new Date();
      const updatedAt = parseDate(u[13]) || new Date();

      // If user had explicit role in model_has_roles, resolve it
      if (userRoleMap[mysqlId] && idMap.roles[userRoleMap[mysqlId]]) {
        const assignedRoleDoc = await rolesCollection.findOne({ _id: idMap.roles[userRoleMap[mysqlId]] });
        if (assignedRoleDoc) {
          role = assignedRoleDoc.name;
        }
      }

      const existing = await usersCollection.findOne({ email });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await usersCollection.updateOne(
          { _id: mongoId },
          {
            $set: {
              name,
              google_id: googleId,
              role,
              status,
              approval_status: approvalStatus,
              phone,
              avatar,
              email_verified_at: emailVerifiedAt,
              password,
              remember_token: rememberToken,
              mysql_id: mysqlId,
              updated_at: updatedAt,
            },
          }
        );
      } else {
        mongoId = new ObjectId();
        await usersCollection.insertOne({
          _id: mongoId,
          name,
          email,
          google_id: googleId,
          role,
          status,
          approval_status: approvalStatus,
          phone,
          avatar,
          email_verified_at: emailVerifiedAt,
          password,
          remember_token: rememberToken,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.users[mysqlId] = mongoId;
    }
    migrationStats.users = userRows.length;
    console.log(`✅ Migrated ${userRows.length} users (all password hashes and Google IDs preserved).`);

    // ==========================================
    // 6. MIGRATE VENDORS
    // ==========================================
    console.log("\n--- Migrating Vendors ---");
    const vendorRows = extractInsertRows("vendors");
    // (id, user_id, shop_name, slug, logo, banner, support_phone, description, return_policy, commission_rate, bank_details, status, created_at, updated_at)
    const vendorsCollection = db.collection("vendors");
    for (const v of vendorRows) {
      const mysqlId = v[0];
      const mysqlUserId = v[1];
      const shopName = v[2];
      const slug = v[3];
      const logo = v[4] || null;
      const banner = v[5] || null;
      const supportPhone = v[6] || null;
      const description = v[7] || null;
      const returnPolicy = v[8] || null;
      const commissionRate = typeof v[9] === "number" ? v[9] : 10.0;
      let bankDetails = null;
      try {
        if (v[10]) bankDetails = JSON.parse(v[10]);
      } catch {}
      const status = v[11] || "active";
      const createdAt = parseDate(v[12]) || new Date();
      const updatedAt = parseDate(v[13]) || new Date();

      const userMongoId = idMap.users[mysqlUserId];
      if (!userMongoId) {
        console.warn(`⚠️ Warning: Vendor ${shopName} references non-existent user_id ${mysqlUserId}`);
      }

      const existing = await vendorsCollection.findOne({ slug });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await vendorsCollection.updateOne(
          { _id: mongoId },
          {
            $set: {
              user_id: userMongoId,
              shop_name: shopName,
              logo,
              banner,
              support_phone: supportPhone,
              description,
              return_policy: returnPolicy,
              commission_rate: commissionRate,
              bank_details: bankDetails,
              status,
              mysql_id: mysqlId,
              updated_at: updatedAt,
            },
          }
        );
      } else {
        mongoId = new ObjectId();
        await vendorsCollection.insertOne({
          _id: mongoId,
          user_id: userMongoId,
          shop_name: shopName,
          slug,
          logo,
          banner,
          support_phone: supportPhone,
          description,
          return_policy: returnPolicy,
          commission_rate: commissionRate,
          bank_details: bankDetails,
          status,
          balance: 0.0,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
    }
    migrationStats.vendors = vendorRows.length;
    console.log(`✅ Migrated ${vendorRows.length} vendors.`);

    // ==========================================
    // 7. MIGRATE CATEGORIES
    // ==========================================
    console.log("\n--- Migrating Categories ---");
    const categoryRows = extractInsertRows("categories");
    // (id, name, slug, icon, banner, commission_rate, is_active, is_verified_featured, order, parent_id, created_at, updated_at)
    const categoriesCollection = db.collection("categories");
    // Pass 1: Insert all categories with parent_id: null initially
    for (const c of categoryRows) {
      const mysqlId = c[0];
      const name = c[1];
      const slug = c[2];
      const icon = c[3] || null;
      const banner = c[4] || null;
      const isActive = c[6] === 1 || c[6] === true;
      const isVerifiedFeatured = c[7] === 1 || c[7] === true;
      const order = typeof c[8] === "number" ? c[8] : 0;
      const createdAt = parseDate(c[10]) || new Date();
      const updatedAt = parseDate(c[11]) || new Date();

      const existing = await categoriesCollection.findOne({ slug });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await categoriesCollection.updateOne(
          { _id: mongoId },
          {
            $set: {
              name,
              icon,
              image: banner,
              is_active: isActive,
              is_verified_featured: isVerifiedFeatured,
              order,
              mysql_id: mysqlId,
              updated_at: updatedAt,
            },
          }
        );
      } else {
        mongoId = new ObjectId();
        await categoriesCollection.insertOne({
          _id: mongoId,
          name,
          slug,
          icon,
          image: banner,
          is_active: isActive,
          is_verified_featured: isVerifiedFeatured,
          order,
          parent_id: null,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.categories[mysqlId] = mongoId;
    }
    // Pass 2: Resolve parent_id relationships
    for (const c of categoryRows) {
      const mysqlId = c[0];
      const mysqlParentId = c[9];
      if (mysqlParentId && idMap.categories[mysqlParentId]) {
        await categoriesCollection.updateOne(
          { _id: idMap.categories[mysqlId] },
          { $set: { parent_id: idMap.categories[mysqlParentId] } }
        );
      }
    }
    migrationStats.categories = categoryRows.length;
    console.log(`✅ Migrated ${categoryRows.length} categories (parent hierarchy resolved).`);

    // ==========================================
    // 8. MIGRATE DEPARTMENTS
    // ==========================================
    console.log("\n--- Migrating Departments ---");
    const deptRows = extractInsertRows("departments");
    // (id, name, slug, description, created_at, updated_at)
    const departmentsCollection = db.collection("departments");
    for (const d of deptRows) {
      const mysqlId = d[0];
      const name = d[1];
      const code = d[2]; // slug in mysql, mapped to code in schema
      const description = d[3] || null;
      const createdAt = parseDate(d[4]) || new Date();
      const updatedAt = parseDate(d[5]) || new Date();

      const existing = await departmentsCollection.findOne({ code });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await departmentsCollection.updateOne(
          { _id: mongoId },
          { $set: { name, description, mysql_id: mysqlId, updated_at: updatedAt } }
        );
      } else {
        mongoId = new ObjectId();
        await departmentsCollection.insertOne({
          _id: mongoId,
          name,
          code,
          description,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.departments[mysqlId] = mongoId;
    }
    migrationStats.departments = deptRows.length;
    console.log(`✅ Migrated ${deptRows.length} departments.`);

    // ==========================================
    // 9. MIGRATE DESIGNATIONS
    // ==========================================
    console.log("\n--- Migrating Designations ---");
    const desigRows = extractInsertRows("designations");
    // (id, department_id, title, created_at, updated_at)
    const designationsCollection = db.collection("designations");
    for (const ds of desigRows) {
      const mysqlId = ds[0];
      const mysqlDeptId = ds[1];
      const title = ds[2];
      const createdAt = parseDate(ds[3]) || new Date();
      const updatedAt = parseDate(ds[4]) || new Date();

      const deptMongoId = idMap.departments[mysqlDeptId];

      const existing = await designationsCollection.findOne({
        title,
        department_id: deptMongoId,
      });
      let mongoId;
      if (existing) {
        mongoId = existing._id;
        await designationsCollection.updateOne(
          { _id: mongoId },
          { $set: { mysql_id: mysqlId, updated_at: updatedAt } }
        );
      } else {
        mongoId = new ObjectId();
        await designationsCollection.insertOne({
          _id: mongoId,
          department_id: deptMongoId,
          title,
          level: 1,
          mysql_id: mysqlId,
          created_at: createdAt,
          updated_at: updatedAt,
        });
      }
      idMap.designations[mysqlId] = mongoId;
    }
    migrationStats.designations = desigRows.length;
    console.log(`✅ Migrated ${desigRows.length} designations.`);

    // ==========================================
    // 10. MIGRATE SETTINGS
    // ==========================================
    console.log("\n--- Migrating Settings ---");
    const settingRows = extractInsertRows("settings");
    // (id, key, value, created_at, updated_at)
    const settingsCollection = db.collection("settings");
    for (const s of settingRows) {
      const mysqlId = s[0];
      const key = s[1];
      const value = String(s[2] ?? "");
      const createdAt = parseDate(s[3]) || new Date();
      const updatedAt = parseDate(s[4]) || new Date();

      await settingsCollection.updateOne(
        { key },
        {
          $set: {
            value,
            mysql_id: mysqlId,
            updated_at: updatedAt,
          },
          $setOnInsert: {
            _id: new ObjectId(),
            created_at: createdAt,
          },
        },
        { upsert: true }
      );
    }
    migrationStats.settings = settingRows.length;
    console.log(`✅ Migrated ${settingRows.length} settings.`);

    // ==========================================
    // 11. RECORD MIGRATION LEDGER
    // ==========================================
    const ledgerCollection = db.collection("_migrations_ledger");
    await ledgerCollection.insertOne({
      migration_date: new Date(),
      source_backup: backupFile,
      records_migrated: migrationStats,
      status: "COMPLETED",
    });

    console.log("\n==========================================");
    console.log("🎉 MIGRATION FINISHED SUCCESSFULLY!");
    console.log("Summary of migrated records:");
    for (const [col, count] of Object.entries(migrationStats)) {
      console.log(` - ${col.padEnd(20)}: ${count} records`);
    }
    console.log("==========================================");
  } finally {
    await client.close();
  }
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
