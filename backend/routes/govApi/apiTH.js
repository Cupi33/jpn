import express from 'express';
import { execute } from "../../config/db.js";
// import oracleDB from 'oracledb';
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

export default router;