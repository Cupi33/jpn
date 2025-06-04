import express from 'express';
import { execute } from "../../config/db.js";
// import oracleDB from 'oracledb';

const router = express.Router();

router.post('/listPending', async (req, res) => {
  const { citizenID } = req.body;

  if (!citizenID) {
    return res.status(400).json({ 
      success: false, 
      message: 'citizenID is required in the request body' 
    });
  }

  try {
    const result = await execute(
      `SELECT * FROM info_inbox_pending
      WHERE citizenID = :1
      ORDER BY APPDATE DESC`,
      [citizenID]  
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: true, 
        message: 'Tiada Permohonan yang sedang diproses' 
      });
    }

    // Map all rows to user objects
    const users = result.rows.map(user => ({
      appID: user.APPID,
      appDate: user.APPDATE,
      appType: user.APPTYPE,
      citizenID: user.CITIZENID
    }));

    res.json({
      success: true,
      message: 'Query Retrieval successful',
      count: users.length,  // Add count of returned records
      users: users          // Return array of all matching records
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

router.post('/listReview', async (req, res) => {
  const { citizenID } = req.body;

  if (!citizenID) {
    return res.status(400).json({ 
      success: false, 
      message: 'citizenID is required in the request body' 
    });
  }

  try {
    const result = await execute(
      `SELECT * FROM info_inbox_review
      WHERE citizenid = :1  
      ORDER BY APPDATE DESC`,
      [citizenID]  
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: true, 
        message: 'Tiada Permohonan yang telah siap disemak' 
      });
    }

    // Map all rows to user objects with Malay decision translation
    const users = result.rows.map(user => ({
      appID: user.APPID,
      appDate: user.APPDATE,
      appType: user.APPTYPE,
      reviewDate: user.REVIEWDATE,
      decision: user.DECISION === 'ACCEPT' ? 'TERIMA' : 'TOLAK' // Translate here
    }));

    res.json({
      success: true,
      message: 'Query Retrieval successful',
      count: users.length,
      users: users
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

router.post('/listDeathPending', async (req, res) => {
  const { appID } = req.body;

  if (!appID) {
    return res.status(400).json({ 
      success: false, 
      message: 'appID is required in the request body' 
    });
  }

  try {
    const result = await execute(
      `SELECT * FROM LIST_DEATH_INFO_PENDING
      WHERE appID = :1
      ORDER BY APPDATE DESC`,
      [appID]  
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: true, 
        message: 'Tiada Permohonan yang sedang diproses' 
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows // ⬅️ This returns an array of rows
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

router.post('/listDeathReview', async (req, res) => {
  const { appID } = req.body;

  if (!appID) {
    return res.status(400).json({ 
      success: false, 
      message: 'appID is required in the request body' 
    });
  }

  try {
    const result = await execute(
      `SELECT * FROM LIST_DEATH_INFO_REVIEW
      WHERE appID = :1
      ORDER BY APPDATE DESC`,
      [appID]  
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: true, 
        message: 'Tiada Permohonan yang sedang diproses' 
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows // ⬅️ This returns an array of rows
    });
    
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

export default router;