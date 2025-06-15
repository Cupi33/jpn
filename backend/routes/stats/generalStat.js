import express from 'express';
import bodyParser from 'body-parser';
import { execute } from "../../config/db.js";

const router = express.Router();
router.use(bodyParser.json());

// This can also be changed to GET for consistency
router.get('/general', async (req, res) => {
  try {
    console.log('Received GET request for /general');

    const result = await execute(`
      SELECT * FROM TOTAL_AND_AGE_CITIZEN
    `);
    
    const result2 = await execute(`
      SELECT * FROM TOTAL_IC_LOSS
    `);
    
    const result3 = await execute(`
      SELECT * FROM TOTAL_DEATH_THISYEAR
    `);

    if (!result || !result2 || !result3) {
      console.error('Query returned no results');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const ic_this_year = result2.rows[0].TOTAL_REPORTED_CASES;
    const ic_previous_year = result2.rows[1].TOTAL_REPORTED_CASES;

    // Calculate percentage difference
    let percentage_difference = 0;
    if (ic_previous_year === 0) {
      percentage_difference = ic_this_year > 0 ? 100 : 0;  // handle zero division
    } else {
      percentage_difference = ((ic_this_year - ic_previous_year) / ic_previous_year) * 100;
      percentage_difference = Math.round(percentage_difference * 100) / 100; // round to 2 decimal places
    }

    const responseData = {
      success: true,
      message: 'Query Successful',
      stat: {
        jumlah_rakyat: result.rows[0].TOTAL || 0,
        purata_umur: Math.round(result.rows[0].AVERAGE_AGE) || 0,
        jumlah_kematian: result3.rows[0].TOTAL_DEATHS || 0,
        kad_hilang: ic_this_year || 0,
        peratus_peningkatan: percentage_difference
      }
    };

    res.json(responseData);

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



router.get('/totalRace', async (req, res) => {
  try {
    console.log('Executing /totalRace query...');
    const result = await execute(`
      SELECT RACE, COUNT(RACE) as "kira"
      FROM CITIZEN
      GROUP BY RACE
    `);

    if (!result || !result.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const raceCounts = {
      cina: 0,
      india: 0,
      lain: 0,
      melayu: 0,
    };
    
    result.rows.forEach(row => {
      const raceKey = row.RACE?.toLowerCase();
      if (raceKey in raceCounts) {
        raceCounts[raceKey] = row.kira;
      }
    });

    res.json({ success: true, message: 'Query Successful', stat: raceCounts });

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/totalReligion', async (req, res) => {
  try {
    console.log('Executing /totalReligion query...');
    const result = await execute(`
      SELECT RELIGION, COUNT(RELIGION) as "kira"
      FROM CITIZEN
      GROUP BY RELIGION
    `);

    if (!result || !result.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const religionCounts = {
      buddha: 0,
      hindu: 0,
      islam: 0,
      kristian: 0,
      lain: 0,
    };
    
    result.rows.forEach(row => {
      const religionKey = row.RELIGION?.toLowerCase();
      if (religionKey in religionCounts) {
        religionCounts[religionKey] = row.kira;
      }
    });

    res.json({ success: true, message: 'Query Successful', stat: religionCounts });

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/ageGroup', async (req, res) => {
  try {
    const result = await execute(`
      SELECT *
      FROM PEOPLE_AGE_GROUP
    `);

    if (!result || !result.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    // Initialize group counters with descriptive keys
    const ageCounts = {
      '0-12': 0,
      '13-22': 0,
      '23-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0
    };

    // Map AGE_GROUP values from the view directly to our keys
    result.rows.forEach(row => {
      const group = row.AGE_GROUP;
      const count = row.TOTAL_PEOPLE;
      if (group in ageCounts) {
        ageCounts[group] = count;
      }
    });

    res.json({ success: true, message: 'Query Successful', stat: ageCounts });

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/genderDistribution', async (req, res) => {
  try {
    console.log('Executing /genderDistribution query...');
    const result = await execute(`
      SELECT GENDER, TOTAL_COUNT, PERCENTAGE
      FROM PERCENTAGE_GENDER
    `);

    if (!result || !result.rows) {
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const genderStats = {
      LELAKI: { count: 0, percentage: 0 },
      PEREMPUAN: { count: 0, percentage: 0 }
    };
    
    result.rows.forEach(row => {
      const genderKey = row.GENDER; 
      if (genderKey === 'LELAKI' || genderKey === 'PEREMPUAN') {
        genderStats[genderKey] = {
          count: row.TOTAL_COUNT,
          percentage: row.PERCENTAGE
        };
      }
    });

    res.json({ success: true, message: 'Query Successful', stat: genderStats });

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/totalDeath', async (req, res) => {
  try {
    console.log('Executing /totalDeath query...');
    const result = await execute(`
      SELECT YEAR, TOTAL_DEATHS
      FROM TOTAL_DEATH
    `);

    // The view might return no rows if there are no deaths in the specified period.
    // This is valid, so we'll return an empty stat object.
    if (!result || !result.rows) {
      console.log('Query for /totalDeath returned no results.');
      return res.json({ success: true, message: 'Query Successful, no deaths recorded in the period.', stat: {} });
    }

    const deathCounts = {};
    
    result.rows.forEach(row => {
      // Column names from Oracle are typically uppercase unless quoted
      deathCounts[row.YEAR] = row.TOTAL_DEATHS;
    });

    res.json({ success: true, message: 'Query Successful', stat: deathCounts });

  } catch (err) {
    console.error('Retrieval error for /totalDeath:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/totalBorn', async (req, res) => {
  try {
    console.log('Executing /totalBorn query...');
    const result = await execute(`
      SELECT YEAR, TOTAL_BIRTHS
      FROM TOTAL_BORN
    `);

    // The TOTAL_BORN view should always return rows, so an empty result is an error.
    if (!result || !result.rows || !result.rows.length) {
      console.error('Query for /totalBorn returned no results, which is unexpected.');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const bornCounts = {};
    
    result.rows.forEach(row => {
      // Column names from Oracle are typically uppercase unless quoted
      bornCounts[row.YEAR] = row.TOTAL_BIRTHS;
    });

    res.json({ success: true, message: 'Query Successful', stat: bornCounts });

  } catch (err) {
    console.error('Retrieval error for /totalBorn:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
export default router;