import express from 'express';
import { execute,callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';
// import multer from 'multer';

const router = express.Router();

router.post('/credential', async (req, res) => {
  const { fullname, icno } = req.body;

  try {
    const result = await execute(
      `SELECT * FROM MATCH_CREDENTIAL
        WHERE UPPER(FULLNAME) = UPPER(:1)
        AND icno = :2 AND DEATH_REGISTERED_BY IS NULL`,
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


router.post('/checkMahram', async (req, res) => {
  const { fullname1, icno1, fullname2, icno2 } = req.body;

  try {
    const result = await callProcedure(
      `BEGIN CHECK_MAHRAM( :p_fullname1, :p_icno1, :p_fullname2, :p_icno2,
       :p_mahram, :p_relation); END;`,
      {
        p_fullname1 : fullname1,
        p_icno1     : icno1,
        p_fullname2 : fullname2,
        p_icno2     : icno2,
        p_mahram: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING , maxsize:20 },
        p_relation: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING , maxsize:20 }
      }
    );

  
    res.status(201).json({
      success: true,
      message: 'Pemeriksaan Berjaya',
      application: {
        mahram: result.outBinds.p_mahram,
        hubungan: result.outBinds.p_relation
      }
    });

  } catch (err) {
    console.error('Application error:', err);

    if (err && err.errorNum === 20001) {
      return res.status(400).json({
        success: false,
        message: 'Permohonan Kad Pengenalan dengan sebab yang sama sudah dihantar dan sedang diproses.'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;