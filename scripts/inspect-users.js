import fs from "fs";

const sql = fs.readFileSync("database-backups/mysql_backup_2026-10-19_15-09-10.sql", "utf8");
const userInserts = sql.split("\n").filter((l) => l.startsWith("INSERT INTO `users` VALUES "));
console.log("=== USERS IN BACKUP ===");
console.log(userInserts.join("\n"));
