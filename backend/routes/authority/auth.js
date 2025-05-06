import express from 'express';
import { execute } from "../../config/db.js" // this connects to Oracle DB

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await execute(
      `SELECT citizenID AS "citizenID", username AS "username" 
        FROM account 
        WHERE username = :1 AND password = :2`,
      [username, password]  // this is NOT safe for real apps, but okay for learning
    );

    if (result.rows.length === 0) 
      {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = result.rows[0];

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.citizenID,         // match your table columns
        username: user.username,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { icno, username, password } = req.body;

  try {
    // Step 1: Check if username or IC number already exists
    const result = await execute(
      `SELECT c.citizenID 
       FROM account a
       JOIN citizen c ON a.citizenID = c.citizenID
       WHERE a.username = :1 OR c.icno = :2`,
      [username, icno]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Akaun sudah didaftar atau Username sudah didaftar'
      });
    }

    // Step 2: Get citizenID using IC number
    const citizenResult = await execute(
      `SELECT citizenID FROM citizen WHERE icno = :1`,
      [icno]
    );

    if (citizenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kesilapan Kad Pengenalan'
      });
    }

    const citizenID = citizenResult.rows[0].CITIZENID;

    // Step 3: Insert account using citizenID
    await execute(
      `INSERT INTO account (citizenID, username, password)
       VALUES (:1, :2, :3)`,
      [citizenID, username, password]
    );

    await execute('COMMIT');

    // Step 4: Send success response
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: {
        citizenID,
        username
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;
