import express from 'express';
import { execute,callProcedureWithCursor } from "../../config/db.js";
import oracleDB from 'oracledb';
// import multer from 'multer';

const router = express.Router();

router.post('/credential', async (req, res) => {
  const { fullname, icno } = req.body;

  try {
    const result = await execute(
      `SELECT * FROM MATCH_CREDENTIAL
        WHERE UPPER(FULLNAME) = UPPER(:1)
        AND icno = :2 AND DEATH_REGISTERED_BY IS NULL
        AND RELIGION = 'ISLAM'`,
      [fullname,icno]  
    );

    if (result.rows.length === 0) 
      {
      return res.status(401).json({ success: false, message: 'Nombor Kad Pengenalan dan Nama Penuh tidak sepadan' });
      }

      const user = result.rows[0];

    res.json({
      success: true,
      message: 'Query Retrieval successful',
      user: {
        fullname: user.FULLNAME,         // match your table columns
        icno: user.ICNO,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/searchDependent', async (req, res) => {
  const { fullname, icno } = req.body;

  let connection;

  try {
    const bindParams = {
      p_fullname: fullname,
      p_icno: icno,
      p_message: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 100 },
      p_wifename: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 500 },
      p_children: { dir: oracleDB.BIND_OUT, type: oracleDB.CURSOR }
    };

    const procSql = `BEGIN CARI_TANGGUNGAN(:p_fullname, :p_icno, :p_message, :p_wifename, :p_children); END;`;

    const result = await callProcedureWithCursor(procSql, bindParams);
    const message = result.outBinds.p_message;
    const wifename = result.outBinds.p_wifename;
    const childrenCursor = result.outBinds.p_children;
    connection = result.connection; // <-- we get connection from the returned result

    const children = [];
    let row;
    while ((row = await childrenCursor.getRow())) {
      children.push({
        child_name: row.CHILD_NAME,
        child_age: row.CHILD_AGE,
        child_gender: row.CHILD_GENDER
      });
    }

    await childrenCursor.close();
    await connection.close(); // close connection after cursor is done

    res.json({
      success: true,
      message: message,
      wife_name: wifename,
      children: children
    });

  } catch (err) {
    if (connection) await connection.close();  // still close connection if error happens
    console.error('Error executing CARI_TANGGUNGAN:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;