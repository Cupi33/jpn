// db.js (with execute function)
import oracledb from 'oracledb';

const dbConfig = {
  user: "cupi",
  password: "password",
  connectString: "127.0.0.1:10521/jpn"
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

// ✅ Add this function:
export async function execute(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      query,
      params,
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true   // 👈 Add this line!
      }
    );
    return result;
  } catch (err) {
    console.error("❌ Execute error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ Error closing connection:", err);
      }
    }
  }
}

export async function callProcedure(procSql, bindParams) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(procSql, bindParams);
    await connection.close();
    return result;
  } catch (err) {
    if (connection) await connection.close();
    throw err;
  }
}

export async function callProcedureWithCursor(procSql, bindParams) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(procSql, bindParams, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    result.connection = connection;  // don't close yet
    return result;
  } catch (err) {
    if (connection) await connection.close();
    throw err;
  }
}
