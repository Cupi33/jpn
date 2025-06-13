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

router.get('/deathTotal5year', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM AGE_DECEASED_5YEARS`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Initialize age groups
    const ageGroups = {
      '0-17': 0,
      '18-24': 0,
      '25-39': 0,
      '40-59': 0,
      '60+': 0
    };

    result.rows.forEach(row => {
      const age = Number(row.AGE_DEATH || row.age_death);

      if (age >= 0 && age <= 17) {
        ageGroups['0-17']++;
      } else if (age >= 18 && age <= 24) {
        ageGroups['18-24']++;
      } else if (age >= 25 && age <= 39) {
        ageGroups['25-39']++;
      } else if (age >= 40 && age <= 59) {
        ageGroups['40-59']++;
      } else if (age >= 60) {
        ageGroups['60+']++;
      }
    });

    res.json({
      success: true,
      message: 'Deceased population by age group retrieved successfully',
      stats: ageGroups
    });

  } catch (err) {
    console.error('Retrieval error for /newbornTotal5year:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/genderDeath5year', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM GENDER_DEATH_5YEAR`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Process rows to uniform output
    const stats = result.rows.map(row => ({
      year: row.YEAR || row.year,
      female: Number(row.FEMALE || row.female || 0),
      male: Number(row.MALE || row.male || 0)
    }));

    res.json({
      success: true,
      message: 'Gender-based death data for the last 5 years retrieved successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /genderDeath5year:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/avgAgeOfDeath', async (req, res) => {
  try {
    const result = await execute(`SELECT * FROM avgAgeOfDeath`);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Build a clean object to store averages for each gender
    const stats = {
      male: null,
      female: null
    };

    result.rows.forEach(row => {
      const gender = (row.GENDER || row.gender || '').toUpperCase();
      const avgAge = parseFloat(row.AVG_AGE_OF_DEATH || row.avg_age_of_death || 0).toFixed(2);
      
      if (gender === 'LELAKI') {
        stats.male = parseFloat(avgAge);
      } else if (gender === 'PEREMPUAN') {
        stats.female = parseFloat(avgAge);
      }
    });

    res.json({
      success: true,
      message: 'Average age of death retrieved successfully',
      stats: stats
    });

  } catch (err) {
    console.error('Retrieval error for /avgAgeOfDeath:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;