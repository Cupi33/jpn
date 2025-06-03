import express from 'express';
import { execute, callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';
import multer from 'multer';

const router = express.Router();

router.post('/profile', async (req, res) => {
  const { icno } = req.body;

  try {
    const result = await execute(
      `SELECT full_name as "fullname", address AS "address"  
        FROM citizen
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
      message: 'Qeury Retrieval successful',
      user: {
        fullname: user.fullname,         // match your table columns
        address: user.address,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;