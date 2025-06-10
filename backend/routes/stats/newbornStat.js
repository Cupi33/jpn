import express from 'express';
import bodyParser from 'body-parser';
import { execute } from "../../config/db.js";

const router = express.Router();

router.get('/newbornState', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM NEWBORN_NEGERI_COUNT`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stats = {};
    let grandTotal = 0;

    // First pass: calculate grand total
    result.rows.forEach(row => {
      const total = Number(row.TOTAL_POPULATION || row.total_population || 0);
      grandTotal += total;
    });

    // Second pass: build stats with percentage
    result.rows.forEach(row => {
      const state = row.NEGERI_LAHIR || row.negeri_lahir || row.state;
      const total = Number(row.TOTAL_POPULATION || row.total_population || 0);
      const percentage = grandTotal > 0 ? parseFloat(((total / grandTotal) * 100).toFixed(2)) : 0;

      stats[state] = {
        total_population: total,
        percentage: percentage
      };
    });

    res.json({
      success: true,
      message: 'State-wise newborn population with percentage calculated successfully',
      total_population: grandTotal,
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /newbornState:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/newbornTotal5year', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM NEWBORN_TOTAL_5YEAR`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Sort rows by birth year ascending, just in case DB didn't sort properly
    const sortedRows = result.rows
      .map(row => ({
        year: row.BIRTH_YEAR || row.birth_year,
        total: Number(row.TOTAL_NEWBORN || row.total_newborn || 0)
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    const stats = [];
    let previousTotal = null;

    sortedRows.forEach(({ year, total }) => {
      const stat = {
        birth_year: year,
        total_newborn: total
      };

      if (previousTotal !== null) {
        const change = ((total - previousTotal) / previousTotal) * 100;
        stat.percentage_change = parseFloat(change.toFixed(2)); // round to 2 decimal places
      }

      previousTotal = total;
      stats.push(stat);
    });

    res.json({
      success: true,
      message: 'Newborn population per year with year-on-year change calculated successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /newbornTotal5year:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



export default router;