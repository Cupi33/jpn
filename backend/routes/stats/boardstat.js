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

router.get('/deathPerYear', async (req, res) => {
  try {
    // ✅ Query directly from your view
    const sql = `SELECT * FROM DEATH_PER_YEAR ORDER BY death_year`;

    const result = await execute(sql);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const stats = result.rows.map(row => ({
      death_year: row.DEATH_YEAR || row.death_year,
      total_deaths: Number(row.TOTAL_DEATHS || row.total_deaths || 0),
      average_age_death: parseFloat((row.AVERAGE_AGE_DEATH || row.average_age_death || 0).toFixed(2))
    }));

    res.json({
      success: true,
      message: 'Yearly death statistics retrieved successfully',
      stats
    });

  } catch (err) {
    console.error('Error executing /deathPerYear API:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deathAppSummary', async (req, res) => {
  try {
    // Query both views in parallel for better performance
    const [decisionResult, commentResult] = await Promise.all([
      execute(`SELECT * FROM TOTAL_DECISION_DEATH`),
      execute(`SELECT * FROM COMMENT_REJECT_DEATH`)
    ]);

    if (!decisionResult.rows || !commentResult.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Prepare total accept & reject
    let total_accept = 0;
    let total_reject = 0;

    decisionResult.rows.forEach(row => {
      const decision = (row.DECISION || row.decision || '').toUpperCase();
      const count = Number(row.TOTAL_APPLICATIONS || row.total_applications || 0);
      if (decision === 'ACCEPT') {
        total_accept = count;
      } else if (decision === 'REJECT') {
        total_reject = count;
      }
    });

    // Prepare comment category counts
    const comments = commentResult.rows.map(row => ({
      comment_category: row.COMMENT_CATEGORY || row.comment_category,
      total_comments: Number(row.TOTAL_COMMENTS || row.total_comments || 0)
    }));

    res.json({
      success: true,
      message: 'Death review summary retrieved successfully',
      data: {
        total_accept,
        total_reject,
        comments
      }
    });

  } catch (err) {
    console.error('Error executing /deathReviewSummary API:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;