import express from 'express';
import { execute } from "../../config/db.js";
// import oracleDB from 'oracledb';
// import multer from 'multer';

const router = express.Router();

router.post('/profile', async (req, res) => {
  const { icno } = req.body;

  try {
    const result = await execute(
      `SELECT * FROM BASIC_INFO_LHDN
        WHERE icno = :icno`,
      [icno]  
    );

    if (result.rows.length === 0) 
      {
      return res.status(401).json({ success: false, message: 'Nombor Kad Pengenalan tidak dijumpai' });
      }

      const user = result.rows[0];

    res.json({
      success: true,
      message: 'Query Retrieval successful',
      user: {
        fullname: user.FULLNAME,         // match your table columns
        address: user.ADDRESS,
        status: user.STATUS
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;