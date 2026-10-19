import fs from "fs";

const sql = fs.readFileSync("database-backups/mysql_backup_2026-10-19_15-09-10.sql", "utf8");

// 1. Identify all tables
const tableRegex = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/g;
let match;
const tables = {};

while ((match = tableRegex.exec(sql)) !== null) {
  const tableName = match[1];
  const schemaBody = match[2];

  // Extract columns
  const lines = schemaBody.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const columns = [];
  const primaryKeys = [];
  const foreignKeys = [];

  for (const line of lines) {
    if (line.startsWith("`")) {
      const colMatch = line.match(/^`([^`]+)`\s+([^\s,]+)/);
      if (colMatch) {
        columns.push({ name: colMatch[1], type: colMatch[2] });
      }
    } else if (line.startsWith("PRIMARY KEY")) {
      const pkMatch = line.match(/PRIMARY KEY \(([^)]+)\)/);
      if (pkMatch) {
        primaryKeys.push(pkMatch[1].replace(/`/g, "").trim());
      }
    } else if (line.startsWith("CONSTRAINT")) {
      foreignKeys.push(line);
    }
  }

  tables[tableName] = {
    columns,
    primaryKeys,
    foreignKeys,
    records: 0,
    sampleRows: [],
  };
}

// 2. Count records from INSERT statements
for (const tableName of Object.keys(tables)) {
  const insertPrefix = `INSERT INTO \`${tableName}\` VALUES `;
  const lines = sql.split("\n");
  for (const line of lines) {
    if (line.startsWith(insertPrefix)) {
      const dataStr = line.substring(insertPrefix.length).trim().replace(/;$/, "");
      
      // Parse SQL tuple values carefully
      let inString = false;
      let escape = false;
      let depth = 0;
      let currentTuple = "";
      const tuples = [];

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
              tuples.push(currentTuple);
              currentTuple = "";
              continue;
            }
          }
        }

        if (depth > 0) {
          currentTuple += char;
        }
      }

      tables[tableName].records += tuples.length;
      if (tuples.length > 0 && tables[tableName].sampleRows.length === 0) {
        tables[tableName].sampleRows = tuples.slice(0, 2);
      }
    }
  }
}

console.log("=================================================");
console.log("MYSQL BACKUP INSPECTION REPORT");
console.log("Backup file: database-backups/mysql_backup_2026-10-19_15-09-10.sql");
console.log(`Total Tables: ${Object.keys(tables).length}`);
console.log("=================================================");

for (const [name, info] of Object.entries(tables)) {
  console.log(`Table: ${name.padEnd(25)} | Records: ${String(info.records).padStart(4)} | PK: [${info.primaryKeys.join(", ")}]`);
}
