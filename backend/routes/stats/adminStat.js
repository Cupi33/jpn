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

router.get('/staffHistoryReview', async (req, res) => {
  // 1. Get staffId from the request query parameters
  const { staffId } = req.query;

  // 2. Add validation: if no staffId is provided, return an error
  if (!staffId) {
    return res.status(400).json({ success: false, message: 'staffId is a required parameter.' });
  }

  try {
    console.log(`Executing /staffHistoryReview query for staffId: ${staffId}`);

    // 3. Modify the SQL query to filter by STAFFID
    const sql = `
      SELECT STAFFID, APPTYPE, DECISION, TOTAL
      FROM list_staff_review
      WHERE STAFFID = :staffId
    `;

    // 4. Pass the staffId as a bind parameter to the execute function for security
    const result = await execute(sql, [staffId]);

    if (!result || !result.rows) {
      console.error('Query for /staffHistoryReview returned no results object.');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }
    
    res.json({ 
      success: true, 
      message: 'Query Successful', 
      stat: result.rows 
    });

  } catch (err) {
    console.error(`Retrieval error for /staffHistoryReview with staffId ${staffId}:`, err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/staffDailyReview', async (req, res) => {
  const { staffId } = req.query;

  if (!staffId) {
    return res.status(400).json({ success: false, message: 'staffId is a required parameter.' });
  }

  try {
    console.log(`Executing /staffDailyReview query for staffId: ${staffId}`);
    
    // The SQL query uses your new view and filters by the provided staffId
    const sql = `
      SELECT APPTYPE, total_applied_today, total_reviewed, total_accepted, total_rejected
      FROM staff_daily_review_by_apptype
      WHERE STAFFID = :staffId
    `;

    // Pass the staffId as a bind parameter for security
    const result = await execute(sql, [staffId]);

    if (!result || !result.rows) {
      console.error('Query for /staffDailyReview returned no results object.');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }
    
    res.json({ 
      success: true, 
      message: 'Query Successful', 
      stat: result.rows 
    });

  } catch (err) {
    console.error(`Retrieval error for /staffDailyReview with staffId ${staffId}:`, err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;