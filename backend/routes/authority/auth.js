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
      return res.status(401).json({ success: false, message: 'Salah username atau kata laluan' });
      }

      const user = result.rows[0];
      const citizenID = user.citizenID;

      const result2 = await execute(
      `SELECT * 
        FROM CITIZEN CT
        JOIN ACCOUNT AC
        ON CT.CITIZENID = AC.CITIZENID
        WHERE CT.CITIZENID = :citizenID AND AC.STATUSACCOUNT = 'INACTIVE' 
        `,
      [citizenID] 
    );

    if (result2.rows.length > 0) 
      {
      return res.status(401).json({ success: false, message: 'Akaun Tidak Aktif' });
      }

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
      `SELECT citizenID, get_age(date_of_birth) as "age"
      FROM citizen WHERE icno = :1`,
      [icno]
    );

    if (citizenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kesilapan Kad Pengenalan'
      });
    }

    // For age validation
  if (citizenResult.rows[0].age <= 10) {  // Changed to <= for consistency with message
    return res.status(400).json({
      success: false,
      message: 'Rakyat berusia 10 tahun ke bawah tidak layak daftar akaun'
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

router.post('/loginStaff', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await execute(
      `SELECT staffID AS "staffID", username AS "username" 
        FROM STAFF 
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
        id: user.staffID,         // match your table columns
        username: user.username,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/changeUsername', async (req, res) => {
  const { username, citizenID} = req.body;

  try {
    const result = await execute(
      `SELECT *
        FROM account 
        WHERE username = :1 `,
      [username]  
    );

    if (result.rows.length > 0) 
      {
      return res.status(401).json({ success: false, message: 'Username sudah diguna penggua lain' });
      }


      const result2 = await execute(
      `UPDATE ACCOUNT
      SET username = :1
      WHERE CITIZENID = :2
        `,
      [username, citizenID] 
    );

    if (result2.rowsAffected === 0) {
  return res.status(404).json({
    success: false,
    message: 'Citizen ID tidak dijumpai atau tiada perubahan berlaku',
  });
}

    res.json({
      success: true,
      message: 'Username berjaya diubah',
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/changePassword', async (req, res) => {
  const { oldpassword, newpassword, username } = req.body;

  try {
    // Step 1: Check if old password matches
    const result = await execute(
      `SELECT * FROM account WHERE username = :1 AND password = :2`,
      [username, oldpassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Salah kata laluan' });
    }

    if(oldpassword === newpassword)
    {
      return res.status(401).json({ success: false, message: 'Sila gunakan kata laluan yang berbeza daripada kata laluan sebelumnya' });
    }

    // Step 2: Update the password
    const result2 = await execute(
      `UPDATE account SET password = :1 WHERE username = :2`,
      [newpassword, username]
    );

    if (result2.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'USERNAME TIDAK DIJUMPAI',
      });
    }

    res.json({
      success: true,
      message: 'Kata laluan berjaya diubah',
    });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/validMykad', async (req, res) => {

  const { citizenID } = req.query;
  try {
    const result = await execute(`
      SELECT valid_mykad(:1) from dual
    `,[citizenID]);

    
    
    res.json({ 
      success: true, 
      message: 'Query Successful', 
      stat: result.rows 
    });

  } catch (err) {
    console.error('Retrieval error for /validMykad:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
