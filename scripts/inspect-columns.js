import fs from "fs";

const sql = fs.readFileSync("database-backups/mysql_backup_2026-10-19_15-09-10.sql", "utf8");

const targetTables = [
  "users",
  "roles",
  "permissions",
  "model_has_roles",
  "role_has_permissions",
  "vendors",
  "categories",
  "departments",
  "designations",
  "settings"
];

for (const table of targetTables) {
  const tableRegex = new RegExp("CREATE TABLE `" + table + "` \\(([\\s\\S]*?)\\) ENGINE=");
  const match = sql.match(tableRegex);
  if (match) {
    const cols = match[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("`"))
      .map((l) => {
        const m = l.match(/^`([^`]+)`\s+([^,]+)/);
        return m ? `${m[1]} (${m[2]})` : "";
      });
    console.log(`\n=== Table: ${table} ===`);
    console.log("Columns:\n  " + cols.join("\n  "));

    // Find and print INSERT lines
    const insertPrefix = `INSERT INTO \`${table}\` VALUES `;
    const insertLine = sql.split("\n").find((l) => l.startsWith(insertPrefix));
    if (insertLine) {
      console.log("Data snippet (first 300 chars):", insertLine.substring(0, 300));
    }
  }
}
