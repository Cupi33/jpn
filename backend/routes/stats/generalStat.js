import express from 'express';
import bodyParser from 'body-parser';
import { execute } from "../../config/db.js";

const router = express.Router();
router.use(bodyParser.json()); // Ensuring JSON parsing

router.post('/general', async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    console.log('Executing first query...');
    const result = await execute(`
      SELECT count(citizenID) AS "jumlah_rakyat", 
             TRUNC(AVG(EXTRACT(YEAR FROM SYSDATE) - EXTRACT(YEAR FROM date_of_birth))) AS "purata_umur",
             count(death_registered_by) AS "jumlah_kematian"
      FROM citizen
    `);
    console.log('Query 1 Result:', result);

    console.log('Executing second query...');
    const result2 = await execute(`
      SELECT count(cardID) AS "kad_hilang"
      FROM ic_card
      WHERE activestatus = 'INACTIVE'
    `);
    console.log('Query 2 Result:', result2);

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

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/totalRace', async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    console.log('Executing first query...');
    const result = await execute(`
      SELECT RACE, COUNT(RACE) as "kira"
        FROM CITIZEN
        GROUP BY RACE
        ORDER BY RACE ASC
    `);
    console.log('Query 1 Result:', result);

    if (!result  || !result.rows.length ) {
      console.error('Query returned no results');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stat1 = result.rows[0] || {};
    const stat2 = result.rows[1] || {};
    const stat3 = result.rows[2] || {};
    const stat4 = result.rows[3] || {};
    

    const responseData = {
      success: true,
      message: 'Query Successful',
      stat: {
        cina: stat1.kira || 0,
        india: stat2.kira || 0,
        lain: stat3.kira || 0,
        melayu: stat4.kira || 0,
      }
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/totalReligion', async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    console.log('Executing first query...');
    const result = await execute(`
      SELECT RELIGION, COUNT(RELIGION) as "kira"
      FROM CITIZEN
      GROUP BY RELIGION
      ORDER BY RELIGION ASC
    `);
    console.log('Query 1 Result:', result);

    if (!result  || !result.rows.length ) {
      console.error('Query returned no results');
      return res.status(400).json({ success: false, message: 'Query returned no results' });
    }

    const stat1 = result.rows[0] || {};
    const stat2 = result.rows[1] || {};
    const stat3 = result.rows[2] || {};
    const stat4 = result.rows[3] || {};
    const stat5 = result.rows[4] || {};
    

    const responseData = {
      success: true,
      message: 'Query Successful',
      stat: {
        buddha: stat1.kira || 0,
        hindu: stat2.kira || 0,
        islam: stat3.kira || 0,
        kristian: stat4.kira || 0,
        lain: stat5.kira || 0,
      }
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (err) {
    console.error('Retrieval error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
