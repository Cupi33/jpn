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
      SELECT count(citizenID) AS "jumlah_rakyat", 
             TRUNC(AVG(EXTRACT(YEAR FROM SYSDATE) - EXTRACT(YEAR FROM date_of_birth))) AS "purata_umur",
             count(death_registered_by) AS "jumlah_kematian"
      FROM citizen
    `);
    
    const result2 = await execute(`
      SELECT count(cardID) AS "kad_hilang"
      FROM ic_card
      WHERE activestatus = 'INACTIVE'
    `);
    
    if (!result || !result2 || !result.rows.length || !result2.rows.length) {
      console.error('Query returned no results');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stat1 = result.rows[0] || {};
    const stat2 = result2.rows[0] || {};

    const responseData = {
      success: true,
      message: 'Query Successful',
      stat: {
        jumlah_rakyat: stat1.jumlah_rakyat || 0,
        purata_umur: stat1.purata_umur || 0,
        jumlah_kematian: stat1.jumlah_kematian || 0,
        kad_hilang: stat2.kad_hilang || 0,
      }
    };

    res.json(responseData);

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CHANGED: from router.post to router.get
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

// CHANGED: from router.post to router.get
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

export default router;