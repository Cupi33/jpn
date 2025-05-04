// ES Module version of db.js
import oracledb from 'oracledb';

const dbConfig = {
  user: "c##cupi",
  password: "password",
  connectString: "localhost:1521/orcl"
};

export async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log("✅ OracleDB connected");
    return connection;
  } catch (err) {
    console.error("❌ Connection error:", err);
    throw err;
  }
}
