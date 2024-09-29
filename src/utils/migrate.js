require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pgp = require("pg-promise")();
const db = pgp(process.env.POSTGRES_URL);

async function runMigrations() {
	const migrationsDir = path.join(__dirname, "../..", "migrations");
	const files = fs.readdirSync(migrationsDir);

	for (const file of files) {
		const filePath = path.join(migrationsDir, file);
		const sql = fs.readFileSync(filePath, "utf-8");
		await db.none(sql);
		console.log(`Executed: ${file}`);
	}

	console.log("Migrations completed.");
}

runMigrations().catch((error) => {
	console.error("Migration failed:", error);
});
