import express from 'express';
import { execute } from "../../config/db.js" // this connects to Oracle DB

const router = express.Router();

router.get('/kependudukan10tahun', async (req, res) => {
  try {
    // Query all three views
    const [deathResult, newbornResult, ageResult] = await Promise.all([
      execute(`SELECT * FROM DEATH_TOTAL5YEAR`),
      execute(`SELECT * FROM NEWBORN_TOTAL_5YEAR_STATE`),
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

router.get('/birthDeath5Year', async (req, res) => {
  try {
    const [newbornResult, deathResult] = await Promise.all([
      execute(`SELECT * FROM TOTAL_NEWBORN_5YEARS`),
      execute(`SELECT DEATH_YEAR, TOTAL_DEATHS FROM DEATH_PER_YEAR`)
    ]);

    if (!newbornResult.rows || !deathResult.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Map death data by year
    const deathMap = {};
    deathResult.rows.forEach(row => {
      const year = row.DEATH_YEAR || row.death_year;
      deathMap[year] = Number(row.TOTAL_DEATHS || row.total_deaths || 0);
    });

    // Merge newborn + death by year
    const stats = newbornResult.rows.map(row => {
      const year = row.BIRTH_YEAR || row.birth_year;
      const total_newborns = Number(row.TOTAL_NEWBORNS || row.total_newborns || 0);
      const total_deaths = deathMap[year] || 0;

      return {
        year,
        total_newborns,
        total_deaths
      };
    });

    res.json({
      success: true,
      message: 'Newborn and death statistics per year retrieved successfully',
      stats
    });

  } catch (err) {
    console.error('Error executing /birthDeath5Year API:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/newbornAppSummary', async (req, res) => {
  try {
    const [decisionResult, commentResult] = await Promise.all([
      execute(`SELECT * FROM TOTAL_DECISION_NEWBORN`),     // ✅ Adjusted view
      execute(`SELECT * FROM COMMENT_REJECT_NEWBORN`)      // ✅ Adjusted view
    ]);

    if (!decisionResult.rows || !commentResult.rows) {
      return res.status(400).json({
        success: false,
        message: 'Query returned no results'
      });
    }

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

    const comments = commentResult.rows.map(row => ({
      comment_category: row.COMMENT_CATEGORY || row.comment_category,
      total_comments: Number(row.TOTAL_COMMENTS || row.total_comments || 0)
    }));

    res.json({
      success: true,
      message: 'Newborn review summary retrieved successfully',
      data: {
        total_accept,
        total_reject,
        comments
      }
    });

  } catch (err) {
    console.error('Error executing /newbornAppSummary API:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/icApplicationSummary', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM TOTAL_ICAPP_12MONTHS_DECISION`);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No IC application data found for the past 12 months'
      });
    }

    // Map short codes to user-friendly descriptions
    const reasonMap = {
      ha: 'Kehilangan Kad',
      ta: 'Tukar Alamat',
      mykid: 'Tukar Daripada MYKID ke MYKAD'
    };

    const stats = result.rows.map(row => {
      const rawReason = (row.REASON || row.reason || '').toLowerCase();
      const description = reasonMap[rawReason] || 'Tidak Diketahui';
      return {
        reason: description,
        total_applications: Number(row.TOTAL_APPLICATIONS || row.total_applications || 0),
        total_accepted: Number(row.TOTAL_ACCEPTED || row.total_accepted || 0),
        total_rejected: Number(row.TOTAL_REJECTED || row.total_rejected || 0)
      };
    });

    res.json({
      success: true,
      message: 'IC application summary retrieved successfully',
      data: stats
    });

  } catch (err) {
    console.error('Error fetching IC application summary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/icRejectComments', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM COMMENT_REJECT_IC`);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No IC rejection comment data found'
      });
    }

    const comments = result.rows.map(row => ({
      comment_category: row.COMMENT_CATEGORY || row.comment_category,
      total_comments: Number(row.TOTAL_COMMENTS || row.total_comments || 0)
    }));

    res.json({
      success: true,
      message: 'IC rejection comment summary retrieved successfully',
      data: comments
    });

  } catch (err) {
    console.error('Error fetching IC rejection comments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/icApplicationByGender', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM ICAPP_REVIEW_GENDER`);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No IC application data found by gender'
      });
    }

    const data = result.rows.map(row => ({
      gender: (row.GENDER || row.gender || '').toUpperCase(),
      total_ic_applications: Number(row.TOTAL_IC_APPLICATIONS || row.total_ic_applications || 0),
      avg_age: parseFloat((row.AVG_AGE || row.avg_age || 0).toFixed(2))
    }));

    res.json({
      success: true,
      message: 'IC application statistics by gender retrieved successfully',
      data
    });

  } catch (err) {
    console.error('Error fetching IC application stats by gender:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/icApplicationByAgeGroup', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM AGE_GROUP_ICAPP`);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No IC application data found by age group'
      });
    }

    const data = result.rows.map(row => ({
      age_group: row.AGE_GROUP || row.age_group,
      total_ic_applications: Number(row.TOTAL_IC_APPLICATIONS || row.total_ic_applications || 0)
    }));

    res.json({
      success: true,
      message: 'IC application statistics by age group retrieved successfully',
      data
    });

  } catch (err) {
    console.error('Error fetching IC application data by age group:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;