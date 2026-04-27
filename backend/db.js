const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: "postgresql://postgres:Gustavo%402393..@db.mwrjldjiogtohsxexqzy.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;