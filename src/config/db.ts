import postgres from "postgres";

const connectionString = process.env.SUPBASE_URI || "";
const db = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false,
  },
  transform: {
    undefined: null,
  },
});

export default db;
