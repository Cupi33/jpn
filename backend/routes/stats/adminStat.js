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

router.get('/citizenPlacement', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM V_CITIZEN_STATE_STATS`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const row = result.rows[0]; // Because SELECT * FROM DUAL always returns 1 row
    const stateTotals = {};
    let grandTotal = 0;

    // Sum up totals and build stateTotals object
    for (const state in row) {
      const stateTotal = Number(row[state]);
      stateTotals[state] = {
        total: stateTotal,
        percentage: 0 // placeholder, calculated below
      };
      grandTotal += stateTotal;
    }

    // Calculate percentage
    for (const state in stateTotals) {
      const percentage = ((stateTotals[state].total / grandTotal) * 100).toFixed(2); // 2 decimal places
      stateTotals[state].percentage = parseFloat(percentage); // convert back to number
    }

    res.json({
      success: true,
      message: 'Citizen placement stats retrieved successfully',
      total_citizens: grandTotal,
      stats: stateTotals
    });

  } catch (err) {
    console.error('Retrieval error for /citizenPlacement:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stateGender', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM LELAKI_PEREMPUAN_NEGERI`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const row = result.rows[0]; // only 1 row from the view/table
    const stateData = {}; // will hold data grouped by state

    // Step 1: Group male and female counts by state
    for (const key in row) {
      const [gender, ...stateParts] = key.split('_'); // e.g., ['LELAKI', 'MELAKA']
      const state = stateParts.join('_'); // in case the state name has underscores

      if (!stateData[state]) {
        stateData[state] = {
          LELAKI: 0,
          PEREMPUAN: 0
        };
      }

      stateData[state][gender] = Number(row[key]);
    }

    // Step 2: Calculate percentages within each state
    const stats = {};
    for (const state in stateData) {
      const male = stateData[state].LELAKI;
      const female = stateData[state].PEREMPUAN;
      const total = male + female;

      stats[state] = {
        LELAKI: {
          total: male,
          percentage: total > 0 ? parseFloat(((male / total) * 100).toFixed(2)) : 0
        },
        PEREMPUAN: {
          total: female,
          percentage: total > 0 ? parseFloat(((female / total) * 100).toFixed(2)) : 0
        },
        total: total
      };
    }

    res.json({
      success: true,
      message: 'State-wise gender breakdown calculated successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /stateGender:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stateRace', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM RACE_STATISTICS`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stats = {};

    result.rows.forEach(row => {
      const state = row.NEGERI || row.state;

      const melayu = Number(row.MELAYU || 0);
      const cina = Number(row.CINA || 0);
      const india = Number(row.INDIA || 0);
      const lain = Number(row.LAIN_LAIN || 0);

      const total = melayu + cina + india + lain;

      stats[state] = {
        MELAYU: {
          total: melayu,
          percentage: total > 0 ? parseFloat(((melayu / total) * 100).toFixed(2)) : 0
        },
        CINA: {
          total: cina,
          percentage: total > 0 ? parseFloat(((cina / total) * 100).toFixed(2)) : 0
        },
        INDIA: {
          total: india,
          percentage: total > 0 ? parseFloat(((india / total) * 100).toFixed(2)) : 0
        },
        LAIN_LAIN: {
          total: lain,
          percentage: total > 0 ? parseFloat(((lain / total) * 100).toFixed(2)) : 0
        },
        total: total
      };
    });

    res.json({
      success: true,
      message: 'State-wise race breakdown calculated successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /stateRace:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stateGroupAge', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM CITIZEN_AGE_STATISTICS`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stats = {};

    result.rows.forEach(row => {
      const state = row.NEGERI || row.state;

      const AGE_0_17 = Number(row.AGE_0_17 || 0);
      const AGE_18_24  = Number(row.AGE_18_24 || 0);
      const AGE_25_39 = Number(row.AGE_25_39 || 0);
      const AGE_40_59 = Number(row.AGE_40_59 || 0);
      const AGE_60_PLUS = Number(row.AGE_60_PLUS || 0);


      stats[state] = {
        AGE_0_17: {
          total: AGE_0_17,       
        },
        AGE_18_24: {
          total: AGE_18_24,
        },
        AGE_25_39: {
          total: AGE_25_39,
        },
        AGE_40_59: {
          total: AGE_40_59,
        },
        AGE_60_PLUS: {
          total: AGE_60_PLUS,
        }
      };
    });

    res.json({
      success: true,
      message: 'State-wise age group breakdown calculated successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /stateGroupAge:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/totalApplication4Month', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM TOTAL_APPLICATION_4MONTH`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stats = result.rows.map(row => ({
      apptype: row.APPTYPE || row.apptype,
      month_1: Number(row.MONTH_1 || row.month_1 || 0),
      month_2: Number(row.MONTH_2 || row.month_2 || 0),
      month_3: Number(row.MONTH_3 || row.month_3 || 0),
      month_4: Number(row.MONTH_4 || row.month_4 || 0)
    }));

    res.json({
      success: true,
      message: 'Total application data for the last 4 months retrieved successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /totalApplication4Month:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;