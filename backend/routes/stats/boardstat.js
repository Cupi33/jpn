import express from 'express';
import { execute } from "../../config/db.js" // this connects to Oracle DB

const router = express.Router();

router.get('/kependudukan10tahun', async (req, res) => {
  try {
    // Query all three views
    const [deathResult, newbornResult, ageResult] = await Promise.all([
      execute(`SELECT * FROM DEATH_TOTAL5YEAR`),
      execute(`SELECT * FROM NEWBORN_TOTAL_5YEAR`),
      execute(`SELECT * FROM AVG_AGE_STATES`)
    ]);

    if (
      !deathResult.rows ||
      !newbornResult.rows ||
      !ageResult.rows
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Query returned no results' });
    }

    // Map death totals by state
    const deathMap = {};
    deathResult.rows.forEach(r => {
      const state = r.STATE || r.state;
      const totalDeath = Number(r['total_death'] || r.total_death || 0);
      deathMap[state.toUpperCase()] = totalDeath;
    });

    // Map newborn totals by state (NEWBORN_TOTAL_5YEAR)
    const newbornMap = {};
    newbornResult.rows.forEach(r => {
      const state = r.STATE || r.state;
      newbornMap[state.toUpperCase()] = Number(
        r.TOTAL_NEWBORN || r.total_newborn || 0
      );
    });

    // Map average ages by state
    const ageMap = {};
    ageResult.rows.forEach(r => {
      const state = r.NEGERI || r.negeri;
      ageMap[state.toUpperCase()] = parseFloat(
        (r.AVG_AGE || r.avg_age || 0).toFixed(2)
      );
    });

    // Define consistent list of Malaysian states
    const allStates = [
      'SELANGOR',
      'JOHOR',
      'MELAKA',
      'KEDAH',
      'KELANTAN',
      'NEGERI SEMBILAN',
      'PAHANG',
      'PERAK',
      'PERLIS',
      'PULAU PINANG',
      'TERENGGANU',
      'SABAH',
      'SARAWAK',
      'KUALA LUMPUR'
    ];

    // Build final response array
    const stats = allStates.map(state => ({
      state,
      total_death: deathMap[state] || 0,
      total_newborn: newbornMap[state] || 0,
      avg_age: ageMap[state] || 0
    }));

    res.json({
      success: true,
      message:
        'State-level death, newborn & average age data retrieved successfully',
      stats
    });
  } catch (err) {
    console.error('Error fetching state data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;