import pgPromise from "pg-promise";
const pgp = pgPromise();
const db = pgp(process.env.POSTGRES_URL);

export default db;
