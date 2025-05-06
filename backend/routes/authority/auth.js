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

// POST /login
router.post('/register', async (req, res) => {
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

export default router;
