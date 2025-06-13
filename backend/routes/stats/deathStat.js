import express from 'express';
import bodyParser from 'body-parser';
import { execute } from "../../config/db.js";

const router = express.Router();

router.get('/deathState', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM DEATH_TOTAL5YEAR`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stats = {};
    let grandTotal = 0;

    // First pass: calculate grand total
    result.rows.forEach(row => {
      // Depending on your DB client, use correct key for "total death"
      const total = Number(row["total death"] || row["TOTAL DEATH"] || 0);
      grandTotal += total;
    });

    // Second pass: build stats with percentage
    result.rows.forEach(row => {
      const state = row.STATE || row.state;
      const total = Number(row["total death"] || row["TOTAL DEATH"] || 0);
      const percentage = grandTotal > 0 ? parseFloat(((total / grandTotal) * 100).toFixed(2)) : 0;

      stats[state] = {
        total_death: total,
        percentage: percentage
      };
    });

    res.json({
      success: true,
      message: 'State-wise death population with percentage calculated successfully',
      total_death: grandTotal,
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /deathState:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;