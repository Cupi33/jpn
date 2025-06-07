import express from 'express';
import bodyParser from 'body-parser';
import { execute } from "../../config/db.js";

const router = express.Router();
router.use(bodyParser.json());

router.get('/applyPendingTotal', async (req, res) => {
  try {
    const result = await execute(`
      SELECT APPTYPE, TOTAL 
      FROM TOTAL_APPLY_PENDING
    `);

    // Following the pattern from generalStat.js for error checking
    if (!result || !result.rows) {
      console.error('Query for /applyPendingTotal returned no results object.');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }
    
    res.json({ 
      success: true, 
      message: 'Query Successful', 
      stat: result.rows 
    });

  } catch (err) {
    console.error('Retrieval error for /applyPendingTotal:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;